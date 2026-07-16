import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { authService } from './auth.service';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema';

export const authRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

authRoutes.post('/register', validate({ body: registerSchema }), async (req, res, next) => {
  try {
    res.status(201).json(await authService.register(req.body));
  } catch (err) {
    next(err);
  }
});

authRoutes.post('/login', loginLimiter, validate({ body: loginSchema }), async (req, res, next) => {
  try {
    res.json(await authService.login(req.body));
  } catch (err) {
    next(err);
  }
});

authRoutes.post('/refresh', validate({ body: refreshSchema }), async (req, res, next) => {
  try {
    res.json(await authService.refresh(req.body.refreshToken));
  } catch (err) {
    next(err);
  }
});

authRoutes.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await authService.logout(req.user!.sub);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRoutes.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  async (req, res, next) => {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ message: 'Se o e-mail existir, você receberá um link de recuperação.' });
    } catch (err) {
      next(err);
    }
  }
);

authRoutes.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  async (req, res, next) => {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
);

authRoutes.patch(
  '/change-password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  async (req, res, next) => {
    try {
      await authService.changePassword(
        req.user!.sub,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.json({ message: 'Senha alterada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
);
