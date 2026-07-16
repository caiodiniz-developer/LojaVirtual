import { useEffect, useMemo, useState } from 'react';
import Image from '@/components/common/image';
import { useRouter } from '@/lib/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Banknote,
  Check,
  CreditCard,
  Home,
  MapPin,
  Plus,
  QrCode,
  Truck,
} from 'lucide-react';
import { addressService } from '@/services/account.service';
import { orderService, type CheckoutInput } from '@/services/order.service';
import { useCartStore, selectCartSubtotal } from '@/stores/cart-store';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { cn, finalPrice, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressForm } from './address-form';
import { CouponInput } from '@/features/cart/coupon-input';
import type { PaymentMethod, ShippingOption } from '@/types';

const steps = [
  { id: 0, label: 'Endereço', icon: MapPin },
  { id: 1, label: 'Frete', icon: Truck },
  { id: 2, label: 'Pagamento', icon: CreditCard },
] as const;

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; hint: string }[] = [
  { id: 'CREDIT_CARD', label: 'Cartão de crédito', icon: CreditCard, hint: 'Aprovação imediata' },
  { id: 'PIX', label: 'PIX', icon: QrCode, hint: 'Aprovação na hora' },
  { id: 'BOLETO', label: 'Boleto', icon: Banknote, hint: 'Compensa em 1 dia útil' },
];

export function CheckoutFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingId, setShippingId] = useState<ShippingOption['id'] | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const { items, coupon, clear } = useCartStore();
  const subtotal = useCartStore(selectCartSubtotal);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;

  const { data: addresses, isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.list(),
  });

  // Preselect the default address
  useEffect(() => {
    if (addresses && !addressId) {
      const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (preferred) setAddressId(preferred.id);
    }
  }, [addresses, addressId]);

  const selectedAddress = addresses?.find((a) => a.id === addressId) ?? null;

  const { data: shippingOptions, isLoading: loadingShipping } = useQuery({
    queryKey: ['shipping', selectedAddress?.zipCode, subtotal - discount],
    queryFn: () => orderService.quoteShipping(selectedAddress!.zipCode, subtotal - discount),
    enabled: Boolean(selectedAddress) && step >= 1,
  });

  const selectedShipping = shippingOptions?.find((o) => o.id === shippingId) ?? null;
  const total = subtotal - discount + (selectedShipping?.price ?? 0);

  const checkout = useMutation({
    mutationFn: (input: CheckoutInput) => orderService.checkout(input),
    onSuccess: (order) => {
      clear();
      // Stock changed server-side — refresh every product view immediately
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      router.push(`/checkout/success?order=${order.id}`);
    },
    onError: (error) => toast.error('Pagamento não aprovado', getApiErrorMessage(error)),
  });

  const canConfirm = useMemo(() => {
    if (!addressId || !shippingId) return false;
    if (method === 'CREDIT_CARD') return cardNumber.replace(/\s/g, '').length === 16;
    return true;
  }, [addressId, shippingId, method, cardNumber]);

  function handleConfirm() {
    if (!canConfirm || !shippingId || !addressId) return;
    checkout.mutate({
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      addressId,
      shippingMethod: shippingId,
      couponCode: coupon?.code,
      payment: {
        method,
        ...(method === 'CREDIT_CARD'
          ? { cardNumber: cardNumber.replace(/\s/g, ''), cardHolder }
          : {}),
      },
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {/* Stepper */}
        <ol className="flex items-center gap-2" aria-label="Etapas do checkout">
          {steps.map((s, index) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => done && setStep(s.id)}
                  disabled={!done && !active}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    active && 'gradient-brand text-white shadow-soft',
                    done && 'text-brand-600 hover:bg-muted dark:text-brand-400',
                    !active && !done && 'text-muted-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full border text-xs',
                      active ? 'border-white/40' : done ? 'border-brand-500 bg-brand-500 text-white' : 'border-border'
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : s.id + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {index < steps.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
              </li>
            );
          })}
        </ol>

        {/* Step 0 — Address */}
        {step === 0 && (
          <section aria-label="Escolha o endereço" className="space-y-4">
            {loadingAddresses && <Skeleton className="h-24 w-full" />}

            {addresses?.map((address) => (
              <button
                key={address.id}
                onClick={() => setAddressId(address.id)}
                aria-pressed={addressId === address.id}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                  addressId === address.id
                    ? 'border-brand-500 bg-brand-500/5 shadow-soft'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {address.label}
                    {address.isDefault && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Padrão
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement ? ` — ${address.complement}` : ''} · {address.district},{' '}
                    {address.city}/{address.state} · CEP {address.zipCode}
                  </span>
                </span>
              </button>
            ))}

            {showAddressForm ? (
              <div className="rounded-2xl border border-border p-5">
                <AddressForm
                  onSuccess={(saved) => {
                    setAddressId(saved.id);
                    setShowAddressForm(false);
                  }}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowAddressForm(true)}>
                <Plus className="h-4 w-4" /> Novo endereço
              </Button>
            )}

            <div className="pt-2">
              <Button size="lg" disabled={!addressId} onClick={() => setStep(1)}>
                Continuar para o frete
              </Button>
            </div>
          </section>
        )}

        {/* Step 1 — Shipping */}
        {step === 1 && (
          <section aria-label="Escolha o frete" className="space-y-4">
            {loadingShipping &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

            {shippingOptions?.map((option) => (
              <button
                key={option.id}
                onClick={() => setShippingId(option.id)}
                aria-pressed={shippingId === option.id}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all',
                  shippingId === option.id
                    ? 'border-brand-500 bg-brand-500/5 shadow-soft'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <span className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-brand-500" aria-hidden />
                  <span>
                    <span className="block text-sm font-semibold">
                      {option.label} <span className="font-normal text-muted-foreground">· {option.carrier}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {option.estimatedDays.min}–{option.estimatedDays.max} dias úteis
                    </span>
                  </span>
                </span>
                <span className="text-sm font-bold">
                  {option.price === 0 ? (
                    <span className="text-emerald-500">Grátis</span>
                  ) : (
                    formatPrice(option.price)
                  )}
                </span>
              </button>
            ))}

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Voltar
              </Button>
              <Button size="lg" disabled={!shippingId} onClick={() => setStep(2)}>
                Continuar para o pagamento
              </Button>
            </div>
          </section>
        )}

        {/* Step 2 — Payment */}
        {step === 2 && (
          <section aria-label="Pagamento" className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentMethods.map(({ id, label, icon: Icon, hint }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  aria-pressed={method === id}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all',
                    method === id
                      ? 'border-brand-500 bg-brand-500/5 shadow-soft'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <Icon className="h-5 w-5 text-brand-500" aria-hidden />
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs text-muted-foreground">{hint}</span>
                </button>
              ))}
            </div>

            {method === 'CREDIT_CARD' && (
              <div className="space-y-4 rounded-2xl border border-border p-5">
                <Input
                  label="Número do cartão"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 16)
                        .replace(/(\d{4})(?=\d)/g, '$1 ')
                    )
                  }
                  hint="Simulação: qualquer número com 16 dígitos é aprovado — termine em 0000 para testar uma recusa."
                />
                <Input
                  label="Nome impresso no cartão"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="COMO ESTÁ NO CARTÃO"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Validade" placeholder="12/29" />
                  <Input label="CVV" placeholder="123" maxLength={4} inputMode="numeric" />
                </div>
              </div>
            )}

            {method === 'PIX' && (
              <div className="flex items-center gap-4 rounded-2xl border border-border p-5">
                <QrCode className="h-10 w-10 text-brand-500" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  O QR Code será gerado após a confirmação. Neste projeto de portfólio, o pagamento
                  PIX é aprovado instantaneamente.
                </p>
              </div>
            )}

            {method === 'BOLETO' && (
              <div className="flex items-center gap-4 rounded-2xl border border-border p-5">
                <Banknote className="h-10 w-10 text-brand-500" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  O boleto será gerado após a confirmação. Neste projeto de portfólio, a compensação
                  é imediata.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button
                size="lg"
                disabled={!canConfirm}
                isLoading={checkout.isPending}
                onClick={handleConfirm}
              >
                Confirmar pedido · {formatPrice(total)}
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* Order summary */}
      <aside className="h-fit space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold">Seu pedido</h2>

        <div className="space-y-2">
          <p className="text-sm font-medium">Cupom de desconto</p>
          <CouponInput />
        </div>

        <ul className="max-h-72 space-y-3 overflow-y-auto border-t border-border pt-4 pr-1">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                {product.images[0] && (
                  <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />
                )}
                <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full gradient-brand px-1 text-[10px] font-bold text-white">
                  {quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{product.title}</span>
              <span className="text-sm font-medium">
                {formatPrice(finalPrice(product) * quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <dt>Cupom {coupon!.code}</dt>
              <dd>−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Frete</dt>
            <dd className="font-medium">
              {selectedShipping
                ? selectedShipping.price === 0
                  ? 'Grátis'
                  : formatPrice(selectedShipping.price)
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-xl font-bold">{formatPrice(total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
