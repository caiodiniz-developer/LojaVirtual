import { useMemo, useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import Image from '@/components/common/image';
import Link from '@/components/common/link';
import type { Product } from '@/types';
import { finalPrice, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { toast } from '@/stores/toast-store';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/reveal';

interface BoughtTogetherProps {
  product: Product;
  related: Product[];
}

/** Classic "frequently bought together" bundle built from related products. */
export function BoughtTogether({ product, related }: BoughtTogetherProps) {
  const companions = useMemo(
    () => related.filter((p) => p.stock > 0).slice(0, 2),
    [related]
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);

  if (companions.length === 0) return null;

  const selected = [product, ...companions.filter((p) => checked[p.id] !== false)];
  const total = selected.reduce((sum, p) => sum + finalPrice(p), 0);

  function handleAddAll() {
    selected.forEach((p) => addItem(p));
    toast.success(`${selected.length} produtos no carrinho 🛍️`, 'Combo adicionado com sucesso.');
    setCartOpen(true);
  }

  return (
    <Reveal>
      <section
        aria-labelledby="bought-together-heading"
        className="rounded-2xl border border-border bg-card p-5 shadow-soft"
      >
        <h2 id="bought-together-heading" className="mb-4 font-display text-base font-semibold">
          Compre junto e complete o treino
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {[product, ...companions].map((item, index) => {
            const isBase = index === 0;
            const included = isBase || checked[item.id] !== false;
            return (
              <div key={item.id} className="flex items-center gap-3">
                {index > 0 && <Plus className="h-4 w-4 text-muted-foreground" aria-hidden />}
                <label
                  className={`relative block cursor-pointer transition-opacity ${included ? '' : 'opacity-40'}`}
                >
                  {!isBase && (
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={(e) => setChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                      className="absolute left-1.5 top-1.5 z-10 h-4 w-4 rounded accent-brand-600"
                      aria-label={`Incluir ${item.title} no combo`}
                    />
                  )}
                  <span className="relative block h-20 w-20 overflow-hidden rounded-xl bg-muted">
                    {item.images[0] && (
                      <Image src={item.images[0]} alt={item.title} fill sizes="80px" className="object-cover" />
                    )}
                  </span>
                </label>
              </div>
            );
          })}

          <div className="ml-auto space-y-2 text-right">
            <p className="text-xs text-muted-foreground">
              {selected.length} {selected.length === 1 ? 'item' : 'itens'}
            </p>
            <p className="font-display text-xl font-bold">{formatPrice(total)}</p>
            <Button size="sm" onClick={handleAddAll}>
              <ShoppingBag className="h-4 w-4" /> Adicionar combo
            </Button>
          </div>
        </div>

        <ul className="mt-4 space-y-1 border-t border-border pt-3">
          {[product, ...companions].map((item, index) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <Link
                href={`/products/${item.slug}`}
                className="min-w-0 truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {index === 0 ? <strong className="text-foreground">Este produto</strong> : item.title}
              </Link>
              <span className="shrink-0 font-medium">{formatPrice(finalPrice(item))}</span>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
