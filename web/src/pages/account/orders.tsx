import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Package } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { formatDate, formatPrice } from '@/lib/utils';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.listMine(),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Meus pedidos</h1>

      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}

      {orders && orders.length === 0 && (
        <EmptyState
          icon={Package}
          title="Nenhum pedido ainda"
          description="Quando você fizer sua primeira compra, ela aparecerá aqui."
          action={
            <Button>
              <Link href="/products">Explorar produtos</Link>
            </Button>
          }
        />
      )}

      {orders?.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="block rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:border-brand-500/40 hover:shadow-lift"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold">{order.code}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex -space-x-3">
              {order.items.slice(0, 4).map((item) => (
                <span
                  key={item.id}
                  className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-card bg-muted"
                >
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                  )}
                </span>
              ))}
              {order.items.length > 4 && (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-card bg-muted text-xs font-semibold">
                  +{order.items.length - 4}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold">{formatPrice(order.total)}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
