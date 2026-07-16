import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';
import { requireAdmin } from '../../middlewares/auth.middleware';
import { slugify } from '../../utils/slugify';
import { ApiError } from '../../utils/api-error';

export const categoryRoutes = Router();

const upsertCategorySchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional(),
  image: z.string().url().optional(),
  parentId: z.string().nullable().optional(),
});

categoryRoutes.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

categoryRoutes.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw ApiError.notFound('Categoria não encontrada');
    res.json(category);
  } catch (err) {
    next(err);
  }
});

categoryRoutes.post(
  '/',
  requireAdmin,
  validate({ body: upsertCategorySchema }),
  async (req, res, next) => {
    try {
      const category = await prisma.category.create({
        data: { ...req.body, slug: slugify(req.body.name) },
      });
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }
);

categoryRoutes.patch(
  '/:id',
  requireAdmin,
  validate({ body: upsertCategorySchema.partial() }),
  async (req, res, next) => {
    try {
      const category = await prisma.category.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          ...(req.body.name ? { slug: slugify(req.body.name) } : {}),
        },
      });
      res.json(category);
    } catch (err) {
      next(err);
    }
  }
);

categoryRoutes.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const count = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (count > 0) {
      throw ApiError.conflict('Não é possível excluir uma categoria com produtos vinculados');
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
