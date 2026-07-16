import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';
import { ApiError } from '../../utils/api-error';

export const stockAlertRoutes = Router();

const subscribeSchema = z.object({
  email: z.string().email('E-mail inválido'),
  productId: z.string().min(1),
});

stockAlertRoutes.post('/', validate({ body: subscribeSchema }), async (req, res, next) => {
  try {
    const { email, productId } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Produto não encontrado');
    if (product.stock > 0) throw ApiError.badRequest('Este produto já está disponível');

    await prisma.stockAlert.upsert({
      where: { email_productId: { email, productId } },
      create: { email, productId },
      update: { notifiedAt: null },
    });

    res.status(201).json({ message: 'Avisaremos você assim que voltar ao estoque. 📩' });
  } catch (err) {
    next(err);
  }
});
