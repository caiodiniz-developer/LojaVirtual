import { useQuery } from '@tanstack/react-query';
import { Home, Mail, Package, Truck } from 'lucide-react';
import Image from '@/components/common/image';
import { adminService } from '@/services/admin.service';
import {
  estimateDeliveryDate,
  formatDate,
  formatDateTime,
  formatPrice,
  getInitials,
} from '@/lib/utils';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerDetailDrawerProps {
  userId: string | null;
  onClose: () => void;
}

export function CustomerDetailDrawer({ userId, onClose }: CustomerDetailDrawerProps) {
  const { data: customer, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminService.userDetail(userId!),
    enabled: Boolean(userId),
  });

  return (
    <Drawer open={Boolean(userId)} onClose={onClose} title="Detalhes do cliente" className="max-w-xl">
      <div className="space-y-6 p-5">
        {isLoading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        )}

        {customer && (
          <>
            {/* Profile */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-brand text-lg font-bold text-white">
                {getInitials(customer.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {customer.name}
                  <Badge variant={customer.role === 'ADMIN' ? 'brand' : 'default'}>
                    {customer.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                  </Badge>
                </p>
                <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {customer.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cliente desde {formatDate(customer.createdAt)} · {customer.orders.length} pedido
                  {customer.orders.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {/* Addresses */}
            <section aria-label="Endereços">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <Home className="h-4 w-4" aria-hidden /> Endereços ({customer.addresses.length})
              </h3>
              {customer.addresses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Nenhum endereço cadastrado.
                </p>
              ) : (
                <ul className="space-y-2">
                  {customer.addresses.map((address) => (
                    <li key={address.id} className="rounded-xl border border-border bg-card p-3.5 text-sm">
                      <p className="flex items-center gap-2 font-semibold">
                        {address.label}
                        {address.isDefault && <Badge variant="brand">Padrão</Badge>}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        {address.street}, {address.number}
                        {address.complement ? ` — ${address.complement}` : ''} · {address.district}
                        <br />
                        {address.city}/{address.state} · CEP {address.zipCode}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Orders */}
            <section aria-label="Pedidos">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <Package className="h-4 w-4" aria-hidden /> Compras ({customer.orders.length})
              </h3>
              {customer.orders.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Este cliente ainda não fez nenhuma compra.
                </p>
              ) : (
                <ul className="space-y-3">
                  {customer.orders.map((order) => (
                    <li key={order.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold">{order.code}</span>
                          <OrderStatusBadge status={order.status} />
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>

                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex items-center gap-3">
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {item.image && (
                                <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {item.quantity}x {formatPrice(item.price)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                          {order.shippingMethod} ·{' '}
                          {order.shippingCost === 0 ? (
                            <span className="font-semibold text-emerald-500">Frete grátis</span>
                          ) : (
                            formatPrice(order.shippingCost)
                          )}
                        </p>
                        <p>
                          {order.status === 'DELIVERED' ? (
                            <>✅ Entregue</>
                          ) : order.status === 'CANCELLED' ? (
                            <>❌ Cancelado</>
                          ) : (
                            <>
                              📦 Previsão de entrega:{' '}
                              <strong className="text-foreground">
                                {formatDate(estimateDeliveryDate(order.createdAt, order.shippingMethod))}
                              </strong>
                            </>
                          )}
                        </p>
                        <p className="flex justify-between pt-1 text-sm">
                          <span className="text-muted-foreground">Total pago</span>
                          <strong className="font-display text-foreground">
                            {formatPrice(order.total)}
                          </strong>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Drawer>
  );
}
