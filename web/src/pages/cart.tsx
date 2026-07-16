import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { ArrowRight, BookmarkPlus, ShoppingBag, Trash2, Undo2 } from 'lucide-react';
import { useCartStore, selectCartSubtotal } from '@/stores/cart-store';
import { finalPrice, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { CouponInput } from '@/features/cart/coupon-input';
import { FreeShippingBar, FREE_SHIPPING_THRESHOLD } from '@/features/cart/free-shipping-bar';
import { useRouter } from '@/lib/navigation';

export default function CartPage() {
  const { items, savedItems, coupon, removeItem, setQuantity, saveForLater, moveToCart, removeSaved } =
    useCartStore();
  const subtotal = useCartStore(selectCartSubtotal);
  const router = useRouter();

  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = subtotal - discount;

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Seu carrinho está vazio"
          description="Adicione produtos incríveis e volte aqui para finalizar sua compra."
          action={
            <Button onClick={() => router.push('/products')}>
              Explorar produtos <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold tracking-tight">
        Carrinho <span className="text-muted-foreground">({items.length})</span>
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
        <ul className="divide-y divide-border">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-5 py-5">
              <Link
                href={`/products/${product.slug}`}
                className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted"
              >
                {product.images[0] && (
                  <Image src={product.images[0]} alt={product.title} fill sizes="112px" className="object-cover" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(finalPrice(product))} cada
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    aria-label={`Remover ${product.title}`}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <QuantitySelector
                      value={quantity}
                      max={Math.min(product.stock, 99)}
                      onChange={(q) => setQuantity(product.id, q)}
                    />
                    <button
                      onClick={() => saveForLater(product.id)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">Salvar para depois</span>
                    </button>
                  </div>
                  <p className="font-display font-bold">
                    {formatPrice(finalPrice(product) * quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Seu carrinho está vazio — mas você tem itens salvos logo abaixo. 👇
          </p>
        )}

        {/* Saved for later */}
        {savedItems.length > 0 && (
          <section aria-labelledby="saved-heading" className="mt-10">
            <h2 id="saved-heading" className="mb-4 font-display text-lg font-semibold">
              Salvos para depois <span className="text-muted-foreground">({savedItems.length})</span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {savedItems.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted"
                  >
                    {product.images[0] && (
                      <Image src={product.images[0]} alt={product.title} fill sizes="64px" className="object-cover" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(finalPrice(product))}</p>
                    <div className="mt-1.5 flex gap-3">
                      <button
                        onClick={() => moveToCart(product.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                      >
                        <Undo2 className="h-3 w-3" aria-hidden /> Mover para o carrinho
                      </button>
                      <button
                        onClick={() => removeSaved(product.id)}
                        className="text-xs text-muted-foreground hover:text-red-500"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        </div>

        <aside className="h-fit space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Resumo do pedido</h2>

          <FreeShippingBar subtotal={subtotal} />

          <CouponInput />

          <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <dt>Desconto ({coupon!.code})</dt>
                <dd className="font-medium">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd>
                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                  <span className="font-semibold text-emerald-500">Grátis 🎉</span>
                ) : (
                  <span className="text-muted-foreground">calculado no checkout</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-xl font-bold">{formatPrice(total)}</dd>
            </div>
          </dl>

          <Button size="lg" className="w-full" onClick={() => router.push('/checkout')}>
            Finalizar compra <ArrowRight className="h-4 w-4" />
          </Button>
          <Link
            href="/products"
            className="block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Continuar comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
