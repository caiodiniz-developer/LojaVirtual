import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middlewares/validate.middleware';

export const newsletterRoutes = Router();

const subscribeSchema = z.object({ email: z.string().email('E-mail inválido') });

newsletterRoutes.post('/', validate({ body: subscribeSchema }), async (req, res, next) => {
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: req.body.email },
      create: { email: req.body.email },
      update: {},
    });
    res.status(201).json({ message: 'Inscrição confirmada! 🎉' });
  } catch (err) {
    next(err);
  }
});
