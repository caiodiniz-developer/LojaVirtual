import type { Prisma } from '@prisma/client';

export type NotificationType = 'ORDER' | 'POINTS' | 'STOCK' | 'SYSTEM';

interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

/** Creates an in-app notification inside a transaction (fire-and-forget by callers). */
export function notify(tx: Prisma.TransactionClient, input: NotificationInput) {
  return tx.notification.create({ data: input });
}
