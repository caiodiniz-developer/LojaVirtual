import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware';
import { orderService } from './order.service';
import { checkoutSchema, shippingQuoteSchema, updateStatusSchema } from './order.schema';
import { quoteShipping } from './shipping.service';

export const orderRoutes = Router();

orderRoutes.post('/shipping/quote', validate({ body: shippingQuoteSchema }), (req, res) => {
  res.json(quoteShipping(req.body.zipCode, req.body.subtotal));
});

orderRoutes.post('/checkout', requireAuth, validate({ body: checkoutSchema }), async (req, res, next) => {
  try {
    res.status(201).json(await orderService.checkout(req.user!.sub, req.body));
  } catch (err) {
    next(err);
  }
});

orderRoutes.get('/mine', requireAuth, async (req, res, next) => {
  try {
    res.json(await orderService.listMine(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

orderRoutes.get('/mine/:id', requireAuth, async (req, res, next) => {
  try {
    res.json(await orderService.getMine(req.user!.sub, req.params.id));
  } catch (err) {
    next(err);
  }
});

orderRoutes.post('/mine/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    res.json(await orderService.cancelMine(req.user!.sub, req.params.id));
  } catch (err) {
    next(err);
  }
});

orderRoutes.post('/mine/:id/reorder', requireAuth, async (req, res, next) => {
  try {
    res.json(await orderService.reorder(req.user!.sub, req.params.id));
  } catch (err) {
    next(err);
  }
});

// ---------- Admin ----------

const listAllSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(15),
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});

orderRoutes.get('/', requireAdmin, validate({ query: listAllSchema }), async (req, res, next) => {
  try {
    res.json(await orderService.listAll(req.query as unknown as z.infer<typeof listAllSchema>));
  } catch (err) {
    next(err);
  }
});

orderRoutes.patch(
  '/:id/status',
  requireAdmin,
  validate({ body: updateStatusSchema }),
  async (req, res, next) => {
    try {
      res.json(await orderService.updateStatus(req.params.id, req.body.status));
    } catch (err) {
      next(err);
    }
  }
);
