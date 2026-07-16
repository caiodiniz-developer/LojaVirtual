import crypto from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middlewares/auth.middleware';
import { ApiError } from '../../utils/api-error';

export const wishlistRoutes = Router();

const productInclude = {
  product: { include: { category: { select: { name: true, slug: true } } } },
} as const;

// ---------- Public: read a shared wishlist by token (no auth) ----------
wishlistRoutes.get('/shared/:token', async (req, res, next) => {
  try {
    const owner = await prisma.user.findUnique({
      where: { wishlistToken: req.params.token },
      select: { id: true, name: true },
    });
    if (!owner) throw ApiError.notFound('Lista não encontrada');

    const items = await prisma.wishlistItem.findMany({
      where: { userId: owner.id },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ owner: owner.name, items });
  } catch (err) {
    next(err);
  }
});

// ---------- Authenticated ----------
wishlistRoutes.use(requireAuth);

wishlistRoutes.get('/', async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

/** Returns (creating if needed) the public share token for this user's wishlist. */
wishlistRoutes.post('/share', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    let token = user?.wishlistToken;
    if (!token) {
      token = crypto.randomBytes(9).toString('hex');
      await prisma.user.update({ where: { id: req.user!.sub }, data: { wishlistToken: token } });
    }
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/** Toggle: adds when absent, removes when present. Returns { wished: boolean }. */
wishlistRoutes.post('/:productId/toggle', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.sub;

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return res.json({ wished: false });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Produto não encontrado');

    await prisma.wishlistItem.create({ data: { userId, productId } });
    res.status(201).json({ wished: true });
  } catch (err) {
    next(err);
  }
});
