import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { useCartStore } from '@/stores/cart-store';
import { AuthGuard } from '@/components/common/auth-guard';
import { CheckoutFlow } from '@/features/checkout/checkout-flow';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) router.replace('/cart');
  }, [items.length, router]);

  return (
    <AuthGuard>
      <div className="container py-10">
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight">Checkout</h1>
        {items.length > 0 && <CheckoutFlow />}
      </div>
    </AuthGuard>
  );
}
