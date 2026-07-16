import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MapPin, Truck } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { formatPrice, formatZipCode } from '@/lib/utils';
import type { ShippingOption } from '@/types';

interface ShippingEstimatorProps {
  /** Unit price in cents used as the quote subtotal. */
  subtotal: number;
}

export function ShippingEstimator({ subtotal }: ShippingEstimatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ShippingOption[] | null>(null);

  async function handleQuote() {
    if (!/^\d{5}-?\d{3}$/.test(zipCode)) {
      toast.error('Informe um CEP válido (00000-000)');
      return;
    }
    setLoading(true);
    try {
      setOptions(await orderService.quoteShipping(zipCode, subtotal));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <MapPin className="h-4 w-4 text-brand-500" aria-hidden />
        Calcule o frete e o prazo
      </p>
      <div className="flex gap-2">
        <label htmlFor="shipping-zip" className="sr-only">
          CEP
        </label>
        <input
          id="shipping-zip"
          inputMode="numeric"
          placeholder="00000-000"
          value={zipCode}
          onChange={(e) => setZipCode(formatZipCode(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && handleQuote()}
          className="h-10 w-36 rounded-xl border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={handleQuote}
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-xl bg-muted px-4 text-sm font-medium transition-colors hover:bg-muted/70 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          Calcular
        </button>
      </div>

      <AnimatePresence>
        {options && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-1.5 overflow-hidden"
          >
            {options.map((option) => (
              <li
                key={option.id}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                  {option.label} · {option.estimatedDays.min}–{option.estimatedDays.max} dias úteis
                </span>
                <span className="font-semibold">
                  {option.price === 0 ? (
                    <span className="text-emerald-500">Grátis</span>
                  ) : (
                    formatPrice(option.price)
                  )}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
