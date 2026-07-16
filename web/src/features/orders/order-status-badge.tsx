import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  PROCESSING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

const variants: Record<OrderStatus, 'default' | 'brand' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  PAID: 'brand',
  PROCESSING: 'brand',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={variants[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
