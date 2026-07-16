import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { ApiError } from '../../utils/api-error';

export const addressRoutes = Router();

addressRoutes.use(requireAuth);

const upsertSchema = z.object({
  label: z.string().min(1).max(30).default('Casa'),
  street: z.string().min(2).max(120),
  number: z.string().min(1).max(10),
  complement: z.string().max(60).nullable().optional(),
  district: z.string().min(2).max(60),
  city: z.string().min(2).max(60),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  isDefault: z.boolean().default(false),
});

addressRoutes.get('/', async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.sub },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
});

addressRoutes.post('/', validate({ body: upsertSchema }), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const address = await prisma.$transaction(async (tx) => {
      if (req.body.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.address.create({ data: { ...req.body, userId } });
    });
    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
});

addressRoutes.patch('/:id', validate({ body: upsertSchema.partial() }), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) throw ApiError.notFound('Endereço não encontrado');

    const address = await prisma.$transaction(async (tx) => {
      if (req.body.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.address.update({ where: { id: existing.id }, data: req.body });
    });
    res.json(address);
  } catch (err) {
    next(err);
  }
});

addressRoutes.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!existing) throw ApiError.notFound('Endereço não encontrado');
    await prisma.address.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
