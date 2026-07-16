import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { useEffect, useState } from 'react';
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store';
import { finalPrice, formatPrice } from '@/lib/utils';
import { SectionHeader } from '@/features/home/section-header';

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  // Avoid hydration mismatch: the store is persisted in localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const products = useRecentlyViewedStore((s) => s.products).filter((p) => p.id !== excludeId);

  if (!mounted || products.length === 0) return null;

  return (
    <section className="space-y-2">
      <SectionHeader eyebrow="Continue navegando" title="Vistos recentemente" />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group w-40 shrink-0 space-y-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <p className="line-clamp-2 text-xs font-medium">{product.title}</p>
            <p className="text-sm font-semibold">{formatPrice(finalPrice(product))}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
