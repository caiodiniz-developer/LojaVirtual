import type { Coupon } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/api-error';
import { formatPrice } from '../../utils/format';

export async function findValidCoupon(code: string, subtotal: number): Promise<Coupon> {
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) throw ApiError.badRequest('Cupom inválido');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw ApiError.badRequest('Este cupom expirou');
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw ApiError.badRequest('Este cupom atingiu o limite de usos');
  }
  if (coupon.minSubtotal != null && subtotal < coupon.minSubtotal) {
    throw ApiError.badRequest(`Este cupom exige um pedido mínimo de ${formatPrice(coupon.minSubtotal)}`);
  }

  return coupon;
}

export function computeCouponDiscount(coupon: Coupon, subtotal: number): number {
  const discount =
    coupon.type === 'PERCENTAGE' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(discount, subtotal);
}
