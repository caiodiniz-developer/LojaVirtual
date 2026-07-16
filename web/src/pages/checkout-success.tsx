import { Suspense, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from '@/components/common/link';
import { useSearchParams } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Package } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { estimateDeliveryDate, formatDate, formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGuard } from '@/components/common/auth-guard';

/** Celebration burst: two side cannons + a center pop, brand colored. */
function fireConfetti() {
  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ffffff'];
  confetti({ particleCount: 90, spread: 75, origin: { x: 0.5, y: 0.6 }, colors });
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
  }, 250);
}

function SuccessContent() {
  const orderId = useSearchParams().get('order');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getMine(orderId!),
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    if (order) fireConfetti();
  }, [order]);

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden />
      </motion.div>

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">Pedido confirmado! 🎉</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Seu pagamento foi aprovado e o pedido já está sendo preparado. Você pode acompanhar tudo
          em <strong>Meus pedidos</strong>.
        </p>
      </div>

      {isLoading && <Skeleton className="h-24 w-full max-w-sm" />}

      {order && (
        <div className="w-full max-w-sm space-y-2 rounded-2xl border border-border bg-card p-5 text-left shadow-soft">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pedido</span>
            <span className="font-mono font-semibold">{order.code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Itens</span>
            <span className="font-medium">{order.items.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entrega</span>
            <span className="font-medium">{order.shippingMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span className="font-medium">
              {order.shippingCost === 0 ? (
                <span className="text-emerald-500">Grátis 🎉</span>
              ) : (
                formatPrice(order.shippingCost)
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Previsão de entrega</span>
            <span className="font-medium">
              {formatDate(estimateDeliveryDate(order.createdAt, order.shippingMethod))}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-semibold">Total pago</span>
            <span className="font-display font-bold">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/account/orders"
          className="flex h-11 items-center gap-2 rounded-xl gradient-brand px-6 text-sm font-medium text-white shadow-soft transition-all hover:shadow-glow"
        >
          <Package className="h-4 w-4" /> Acompanhar pedido
        </Link>
        <Link
          href="/products"
          className="flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <AuthGuard>
      <Suspense>
        <SuccessContent />
      </Suspense>
    </AuthGuard>
  );
}
