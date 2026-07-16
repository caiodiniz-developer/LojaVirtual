import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CreditCard, MapPin, RotateCcw, Truck, XCircle } from 'lucide-react';
import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { orderService } from '@/services/order.service';
import { estimateDeliveryDate, formatDate, formatDateTime, formatPrice } from '@/lib/utils';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { OrderTimeline } from '@/features/orders/order-timeline';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';

const paymentLabels = { CREDIT_CARD: 'Cartão de crédito', PIX: 'PIX', BOLETO: 'Boleto' };
const CANCELLABLE = ['PENDING', 'PAID', 'PROCESSING'];

export default function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getMine(id),
    enabled: Boolean(id),
  });

  const cancelOrder = useMutation({
    mutationFn: () => orderService.cancelMine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      // Items went back to the shelf — refresh product listings too
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setConfirmCancel(false);
      toast.success('Pedido cancelado', 'O estoque foi devolvido e o pagamento estornado.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const reorder = useMutation({
    mutationFn: () => orderService.reorder(id),
    onSuccess: ({ added, total }) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (added === 0) {
        toast.error('Nenhum item disponível', 'Os produtos deste pedido estão indisponíveis.');
      } else {
        toast.success(
          `${added} de ${total} itens no carrinho 🛒`,
          added < total ? 'Alguns itens estavam indisponíveis.' : 'Tudo pronto para recomprar.'
        );
        navigate('/cart');
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/account/orders"
          aria-label="Voltar aos pedidos"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-2xl font-bold">
          Pedido <span className="font-mono">{order.code}</span>
        </h1>
        <OrderStatusBadge status={order.status} />
        <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" isLoading={reorder.isPending} onClick={() => reorder.mutate()}>
            <RotateCcw className="h-4 w-4" /> Comprar novamente
          </Button>
          {CANCELLABLE.includes(order.status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmCancel(true)}
              className="text-red-500 hover:bg-red-500/10"
            >
              <XCircle className="h-4 w-4" /> Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Tracking timeline */}
      {order.status !== 'CANCELLED' && <OrderTimeline status={order.status} />}

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}x {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <dt>Desconto {order.couponCode ? `(${order.couponCode})` : ''}</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd>{order.shippingCost === 0 ? 'Grátis' : formatPrice(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-lg font-bold">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-brand-500" aria-hidden /> Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{order.shippingAddress.label}</p>
            <p>
              {order.shippingAddress.street}, {order.shippingAddress.number}
              {order.shippingAddress.complement ? ` — ${order.shippingAddress.complement}` : ''}
            </p>
            <p>
              {order.shippingAddress.district} · {order.shippingAddress.city}/
              {order.shippingAddress.state}
            </p>
            <p>CEP {order.shippingAddress.zipCode}</p>
            <p className="flex items-center gap-1.5 pt-2 text-foreground">
              <Truck className="h-4 w-4 text-brand-500" aria-hidden /> {order.shippingMethod}
              {order.shippingCost === 0 && (
                <span className="font-semibold text-emerald-500">· Frete grátis</span>
              )}
            </p>
            {order.status !== 'CANCELLED' && (
              <p className="flex items-center gap-1.5 text-foreground">
                <CalendarClock className="h-4 w-4 text-brand-500" aria-hidden />
                {order.status === 'DELIVERED'
                  ? 'Entregue'
                  : `Previsão: ${formatDate(estimateDeliveryDate(order.createdAt, order.shippingMethod))}`}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-brand-500" aria-hidden /> Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {order.payment ? (
              <>
                <p className="font-medium text-foreground">
                  {paymentLabels[order.payment.method]}
                  {order.payment.cardLast4 ? ` •••• ${order.payment.cardLast4}` : ''}
                </p>
                <p>Valor: {formatPrice(order.payment.amount)}</p>
                {order.payment.paidAt && <p>Pago em {formatDateTime(order.payment.paidAt)}</p>}
              </>
            ) : (
              <p>Sem informações de pagamento.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancelar pedido">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja cancelar o pedido{' '}
            <strong className="font-mono text-foreground">{order.code}</strong>? Os itens voltam ao
            estoque e o pagamento é estornado na hora (simulado).
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Manter pedido
            </Button>
            <Button
              variant="destructive"
              isLoading={cancelOrder.isPending}
              onClick={() => cancelOrder.mutate()}
            >
              Cancelar pedido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
