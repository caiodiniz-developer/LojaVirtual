import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { loyaltyService } from './loyalty.service';

export const loyaltyRoutes = Router();

loyaltyRoutes.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json(await loyaltyService.summary(req.user!.sub));
  } catch (err) {
    next(err);
  }
});
