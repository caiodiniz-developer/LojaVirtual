import { useState } from 'react';
import { TicketPercent, X } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { useCartStore, selectCartSubtotal } from '@/stores/cart-store';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CouponInput() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { coupon, setCoupon } = useCartStore();
  const subtotal = useCartStore(selectCartSubtotal);

  async function applyCoupon() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const validation = await orderService.validateCoupon(code.trim().toUpperCase(), subtotal);
      setCoupon(validation);
      toast.success('Cupom aplicado! 🎉', `Desconto de ${formatPrice(validation.discount)}`);
      setCode('');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <TicketPercent className="h-4 w-4 text-emerald-500" aria-hidden />
          <span className="font-semibold">{coupon.code}</span>
          <span className="text-muted-foreground">(−{formatPrice(coupon.discount)})</span>
        </div>
        <button
          onClick={() => setCoupon(null)}
          aria-label="Remover cupom"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <label htmlFor="coupon" className="sr-only">
        Código do cupom
      </label>
      <input
        id="coupon"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
        placeholder="Cupom de desconto"
        className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm uppercase placeholder:normal-case placeholder:text-muted-foreground/70 focus:border-brand-500 focus:outline-none"
      />
      <Button variant="secondary" onClick={applyCoupon} isLoading={loading} disabled={!code.trim()}>
        Aplicar
      </Button>
    </div>
  );
}
