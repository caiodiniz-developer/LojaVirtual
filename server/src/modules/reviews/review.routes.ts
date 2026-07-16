import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { ApiError } from '../../utils/api-error';
import { awardPoints, POINTS } from '../loyalty/loyalty.service';
import { notify } from '../notifications/notification.service';

export const reviewRoutes = Router();

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6),
  sort: z.enum(['recent', 'helpful', 'rating']).default('recent'),
});

const SORT_MAP = {
  recent: { createdAt: 'desc' },
  helpful: { helpfulCount: 'desc' },
  rating: { rating: 'desc' },
} as const;

reviewRoutes.get('/product/:productId', validate({ query: listSchema }), async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query as unknown as z.infer<typeof listSchema>;
    const where = { productId: req.params.productId };

    const [data, total, buckets] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: SORT_MAP[sort],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      // Rating distribution for the histogram
      prisma.review.groupBy({ by: ['rating'], where, _count: true, orderBy: { rating: 'desc' } }),
    ]);

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      rating: star,
      count: buckets.find((b) => b.rating === star)?._count ?? 0,
    }));

    res.json({
      data,
      distribution,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), hasNextPage: page * limit < total },
    });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(5).max(1000),
  images: z.array(z.string().url()).max(4).default([]),
});

reviewRoutes.post('/', requireAuth, validate({ body: createSchema }), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const { productId, rating, title, comment, images } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Produto não encontrado');

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw ApiError.conflict('Você já avaliou este produto');

    // "Verified purchase": the author has a delivered/paid order containing this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      },
    });
    const verified = Boolean(purchase);

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { userId, productId, rating, title, comment, images, verified },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });

      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      });
      await tx.product.update({
        where: { id: productId },
        data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count },
      });

      // Reward the reviewer with loyalty points
      await awardPoints(tx, userId, POINTS.REVIEW, 'REVIEW');
      await notify(tx, {
        userId,
        type: 'POINTS',
        title: 'Avaliação publicada ⭐',
        body: `Obrigado! Você ganhou ${POINTS.REVIEW} pontos Sphere.`,
        link: `/products/${product.slug}`,
      });

      return created;
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

reviewRoutes.post('/:id/helpful', requireAuth, async (req, res, next) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { helpfulCount: { increment: 1 } },
      select: { id: true, helpfulCount: true },
    });
    res.json(review);
  } catch (err) {
    next(err);
  }
});
