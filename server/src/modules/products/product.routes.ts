import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';
import { requireAdmin } from '../../middlewares/auth.middleware';
import { productService } from './product.service';
import { listProductsSchema, upsertProductSchema } from './product.schema';
import type { ListProductsQuery } from './product.schema';

export const productRoutes = Router();

productRoutes.get('/', validate({ query: listProductsSchema }), async (req, res, next) => {
  try {
    res.json(await productService.list(req.query as unknown as ListProductsQuery));
  } catch (err) {
    next(err);
  }
});

productRoutes.get('/slug/:slug', async (req, res, next) => {
  try {
    res.json(await productService.getBySlug(req.params.slug));
  } catch (err) {
    next(err);
  }
});

productRoutes.get('/slug/:slug/related', async (req, res, next) => {
  try {
    res.json(await productService.related(req.params.slug));
  } catch (err) {
    next(err);
  }
});

// ---------- Admin ----------

productRoutes.get(
  '/admin/all',
  requireAdmin,
  validate({ query: listProductsSchema }),
  async (req, res, next) => {
    try {
      res.json(await productService.list(req.query as unknown as ListProductsQuery, true));
    } catch (err) {
      next(err);
    }
  }
);

const priceHistorySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(90),
});

productRoutes.get(
  '/:id/price-history',
  validate({ query: priceHistorySchema }),
  async (req, res, next) => {
    try {
      const { days } = req.query as unknown as z.infer<typeof priceHistorySchema>;
      res.json(await productService.priceHistory(req.params.id, days));
    } catch (err) {
      next(err);
    }
  }
);

productRoutes.get('/:id', async (req, res, next) => {
  try {
    res.json(await productService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
});

productRoutes.post('/', requireAdmin, validate({ body: upsertProductSchema }), async (req, res, next) => {
  try {
    res.status(201).json(await productService.create(req.body));
  } catch (err) {
    next(err);
  }
});

productRoutes.patch(
  '/:id',
  requireAdmin,
  validate({ body: upsertProductSchema.partial() }),
  async (req, res, next) => {
    try {
      res.json(await productService.update(req.params.id, req.body));
    } catch (err) {
      next(err);
    }
  }
);

productRoutes.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await productService.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
