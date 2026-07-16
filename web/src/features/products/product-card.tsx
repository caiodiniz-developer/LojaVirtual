import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import { RatingStars } from '@/components/ui/rating-stars';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { toast } from '@/stores/toast-store';
import { useIsWished, useToggleWishlist } from '@/hooks/use-wishlist';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const { toggle } = useToggleWishlist();
  const wished = useIsWished(product.id);
  const outOfStock = product.stock === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem(product);
    toast.success('Adicionado ao carrinho 🛍️', product.title);
    setCartOpen(true);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.09, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block" aria-label={product.title}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-transform duration-500 group-hover:scale-105',
                outOfStock && 'opacity-60 grayscale'
              )}
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.discount > 0 && <Badge variant="gradient">-{product.discount}%</Badge>}
            {product.isFeatured && <Badge variant="warning">Destaque</Badge>}
            {outOfStock && <Badge variant="danger">Esgotado</Badge>}
            {!outOfStock && product.stock <= 5 && (
              <Badge variant="warning">Últimas unidades</Badge>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            aria-label={wished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={wished}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full glass opacity-0 shadow-soft transition-all duration-300 hover:scale-110 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Heart
              className={cn('h-4 w-4 transition-colors', wished && 'fill-red-500 text-red-500')}
            />
          </button>

          {!outOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute inset-x-3 bottom-3 flex h-11 translate-y-2 items-center justify-center gap-2 rounded-xl glass text-sm font-semibold opacity-0 shadow-soft transition-all duration-300 hover:bg-background focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <ShoppingBag className="h-4 w-4" /> Adicionar
            </button>
          )}
        </div>

        <div className="space-y-1.5 pt-3">
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.category.name}
            </p>
          )}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {product.title}
          </h3>
          {product.reviewCount > 0 && (
            <RatingStars rating={product.rating} count={product.reviewCount} size="sm" />
          )}
          <Price product={product} size="md" />
        </div>
      </Link>
    </motion.article>
  );
}
