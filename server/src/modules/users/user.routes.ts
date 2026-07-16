import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware';
import { sanitizeUser } from '../auth/auth.service';
import { ApiError } from '../../utils/api-error';

export const userRoutes = Router();

const updateMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatar: z.string().url().nullable().optional(),
});

userRoutes.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw ApiError.notFound('Usuário não encontrado');
    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
});

userRoutes.patch('/me', requireAuth, validate({ body: updateMeSchema }), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.user!.sub }, data: req.body });
    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
});

// ---------- Admin ----------

const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(15),
  search: z.string().trim().optional(),
});

userRoutes.get('/', requireAdmin, validate({ query: listUsersSchema }), async (req, res, next) => {
  try {
    const { page, limit, search } = req.query as unknown as z.infer<typeof listUsersSchema>;
    const where = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** Full customer profile for the admin panel: addresses + order history. */
userRoutes.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
        orders: {
          include: { items: true, payment: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) throw ApiError.notFound('Usuário não encontrado');
    res.json(user);
  } catch (err) {
    next(err);
  }
});
