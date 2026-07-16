import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { useUiStore } from '@/stores/ui-store';
import { useCartStore, selectCartSubtotal } from '@/stores/cart-store';
import { FreeShippingBar } from '@/features/cart/free-shipping-bar';
import { finalPrice, formatPrice } from '@/lib/utils';
import { useRouter } from '@/lib/navigation';

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUiStore();
  const { items, removeItem, setQuantity } = useCartStore();
  const subtotal = useCartStore(selectCartSubtotal);
  const router = useRouter();

  function goTo(path: string) {
    setCartOpen(false);
    router.push(path);
  }

  return (
    <Drawer open={cartOpen} onClose={() => setCartOpen(false)} title={`Carrinho (${items.length})`}>
      {items.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={ShoppingBag}
            title="Seu carrinho está vazio"
            description="Explore nossos produtos e encontre algo especial."
            action={
              <Button onClick={() => goTo('/products')} size="sm">
                Explorar produtos
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 divide-y divide-border px-5">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4 py-4">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={() => setCartOpen(false)}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  {product.images[0] && (
                    <Image src={product.images[0]} alt={product.title} fill sizes="80px" className="object-cover" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
                    <button
                      onClick={() => removeItem(product.id)}
                      aria-label={`Remover ${product.title}`}
                      className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantitySelector
                      size="sm"
                      value={quantity}
                      max={Math.min(product.stock, 99)}
                      onChange={(q) => setQuantity(product.id, q)}
                    />
                    <p className="text-sm font-semibold">
                      {formatPrice(finalPrice(product) * quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-border p-5">
            <FreeShippingBar subtotal={subtotal} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-lg font-bold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Frete e cupons são calculados no checkout.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => goTo('/cart')}>
                Ver carrinho
              </Button>
              <Button onClick={() => goTo('/checkout')}>Finalizar</Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
