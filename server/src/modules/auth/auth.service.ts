import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import type { User } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/api-error';
import { env } from '../../config/env';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from '../../utils/jwt';
import { POINTS } from '../loyalty/loyalty.service';

export type PublicUser = Omit<User, 'password' | 'refreshToken' | 'resetToken' | 'resetTokenExpiresAt'>;

export function sanitizeUser(user: User): PublicUser {
  const { password: _p, refreshToken: _r, resetToken: _t, resetTokenExpiresAt: _e, ...rest } = user;
  return rest;
}

async function issueTokens(user: User) {
  const payload: TokenPayload = { sub: user.id, role: user.role as TokenPayload['role'] };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store only the hash so a database leak does not expose live sessions
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 8) },
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw ApiError.conflict('Este e-mail já está cadastrado');

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: await bcrypt.hash(input.password, 10),
        loyaltyPoints: POINTS.SIGNUP,
        pointsEntries: { create: { amount: POINTS.SIGNUP, reason: 'SIGNUP' } },
        notifications: {
          create: {
            type: 'POINTS',
            title: 'Boas-vindas à Sphere! 🎉',
            body: `Você começou com ${POINTS.SIGNUP} pontos. Acompanhe em Recompensas.`,
            link: '/account/rewards',
          },
        },
      },
    });

    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw ApiError.unauthorized('E-mail ou senha incorretos');
    }

    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Sessão inválida');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshToken || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
      throw ApiError.unauthorized('Sessão inválida');
    }

    // Rotate: the old refresh token is invalidated on every use
    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async logout(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond with success to avoid leaking which e-mails exist
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: crypto.createHash('sha256').update(token).digest('hex'),
        resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    });

    // Portfolio project: no e-mail provider — the link is logged to the API console
    console.log(`🔑 Password reset link: ${env.CLIENT_URL}/reset-password?token=${token}`);
  },

  async resetPassword(token: string, password: string) {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: { resetToken: hashed, resetTokenExpiresAt: { gt: new Date() } },
    });
    if (!user) throw ApiError.badRequest('Link inválido ou expirado');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(password, 10),
        resetToken: null,
        resetTokenExpiresAt: null,
        refreshToken: null, // force re-login everywhere
      },
    });
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('Usuário não encontrado');
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw ApiError.badRequest('Senha atual incorreta');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
  },
};
