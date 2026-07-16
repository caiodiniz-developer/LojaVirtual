import { motion } from 'framer-motion';
import { PartyPopper, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const FREE_SHIPPING_THRESHOLD = 25_000; // R$ 250,00 — same rule as the API

/** Animated "you're X away from free shipping" meter shown in the cart. */
export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const unlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);

  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-border bg-muted/40 p-4"
    >
      <p className="mb-2.5 flex items-center gap-2 text-sm font-medium">
        {unlocked ? (
          <>
            <PartyPopper className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>
              Você ganhou <strong className="text-emerald-500">frete grátis</strong>! 🎉
            </span>
          </>
        ) : (
          <>
            <Truck className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
            <span>
              Faltam <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> para o
              frete grátis
            </span>
          </>
        )}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-border" role="presentation">
        <motion.div
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.1 }}
          className={
            unlocked
              ? 'h-full rounded-full bg-emerald-500'
              : 'h-full rounded-full gradient-brand'
          }
        />
      </div>
    </div>
  );
}
