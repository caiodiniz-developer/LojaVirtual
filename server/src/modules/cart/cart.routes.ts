import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { ApiError } from '../../utils/api-error';

export const cartRoutes = Router();

cartRoutes.use(requireAuth);

const cartInclude = {
  product: {
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      discount: true,
      images: true,
      stock: true,
    },
  },
} as const;

cartRoutes.get('/', async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.sub },
      include: cartInclude,
      orderBy: { createdAt: 'asc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

cartRoutes.post('/', validate({ body: addSchema }), async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.body.productId } });
    if (!product || !product.isActive) throw ApiError.notFound('Produto não encontrado');
    if (product.stock < req.body.quantity) throw ApiError.badRequest('Estoque insuficiente');

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user!.sub, productId: req.body.productId } },
      create: { userId: req.user!.sub, productId: req.body.productId, quantity: req.body.quantity },
      update: { quantity: { increment: req.body.quantity } },
      include: cartInclude,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({ quantity: z.number().int().min(1).max(99) });

cartRoutes.patch('/:productId', validate({ body: updateSchema }), async (req, res, next) => {
  try {
    const item = await prisma.cartItem.update({
      where: { userId_productId: { userId: req.user!.sub, productId: req.params.productId } },
      data: { quantity: req.body.quantity },
      include: cartInclude,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

cartRoutes.delete('/:productId', async (req, res, next) => {
  try {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId: req.user!.sub, productId: req.params.productId } },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

cartRoutes.delete('/', async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.sub } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
