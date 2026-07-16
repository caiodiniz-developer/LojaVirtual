import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';
import { requireAdmin } from '../../middlewares/auth.middleware';
import { computeCouponDiscount, findValidCoupon } from './coupon.service';

export const couponRoutes = Router();

const validateSchema = z.object({
  code: z.string().min(1).transform((v) => v.trim().toUpperCase()),
  subtotal: z.number().int().min(0), // cents
});

couponRoutes.post('/validate', validate({ body: validateSchema }), async (req, res, next) => {
  try {
    const coupon = await findValidCoupon(req.body.code, req.body.subtotal);
    const discount = computeCouponDiscount(coupon, req.body.subtotal);
    res.json({ code: coupon.code, type: coupon.type, value: coupon.value, discount });
  } catch (err) {
    next(err);
  }
});

// ---------- Admin ----------

const upsertSchema = z.object({
  code: z.string().min(3).max(24).transform((v) => v.trim().toUpperCase()),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().int().min(1),
  minSubtotal: z.number().int().min(0).nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
});

couponRoutes.get('/', requireAdmin, async (_req, res, next) => {
  try {
    res.json(await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

couponRoutes.post('/', requireAdmin, validate({ body: upsertSchema }), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.coupon.create({ data: req.body }));
  } catch (err) {
    next(err);
  }
});

couponRoutes.patch(
  '/:id',
  requireAdmin,
  validate({ body: upsertSchema.partial() }),
  async (req, res, next) => {
    try {
      res.json(await prisma.coupon.update({ where: { id: req.params.id }, data: req.body }));
    } catch (err) {
      next(err);
    }
  }
);

couponRoutes.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
