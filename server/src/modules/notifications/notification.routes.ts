import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middlewares/auth.middleware';

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);

notificationRoutes.get('/', async (req, res, next) => {
  try {
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.sub },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.notification.count({ where: { userId: req.user!.sub, read: false } }),
    ]);
    res.json({ items, unread });
  } catch (err) {
    next(err);
  }
});

notificationRoutes.post('/read', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, read: false },
      data: { read: true },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
