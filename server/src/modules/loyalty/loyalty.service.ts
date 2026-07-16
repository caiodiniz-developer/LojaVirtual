import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export type PointsReason = 'ORDER' | 'REVIEW' | 'SIGNUP' | 'REDEEM';

export const POINTS = {
  SIGNUP: 100,
  REVIEW: 50,
  /** 1 point per R$1 spent (total is in cents). */
  perOrderTotal: (totalCents: number) => Math.floor(totalCents / 100),
};

export interface Level {
  key: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  label: string;
  min: number;
  next: number | null;
}

const LEVELS: Level[] = [
  { key: 'BRONZE', label: 'Bronze', min: 0, next: 500 },
  { key: 'SILVER', label: 'Prata', min: 500, next: 1500 },
  { key: 'GOLD', label: 'Ouro', min: 1500, next: 4000 },
  { key: 'DIAMOND', label: 'Diamante', min: 4000, next: null },
];

export function getLevel(points: number): Level {
  return [...LEVELS].reverse().find((level) => points >= level.min) ?? LEVELS[0];
}

/** Awards (or spends, if negative) points inside a transaction and logs the entry. */
export async function awardPoints(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reason: PointsReason
) {
  if (amount === 0) return;
  await tx.pointsEntry.create({ data: { userId, amount, reason } });
  await tx.user.update({
    where: { id: userId },
    data: { loyaltyPoints: { increment: amount } },
  });
}

export const loyaltyService = {
  async summary(userId: string) {
    const [user, entries] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } }),
      prisma.pointsEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const points = user?.loyaltyPoints ?? 0;
    const level = getLevel(points);
    const progress =
      level.next === null ? 100 : Math.round(((points - level.min) / (level.next - level.min)) * 100);

    return {
      points,
      level,
      pointsToNext: level.next === null ? 0 : level.next - points,
      progress,
      entries,
    };
  },
};
