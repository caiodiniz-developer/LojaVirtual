import { cn, finalPrice, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface PriceProps {
  product: Pick<Product, 'price' | 'discount'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Price({ product, size = 'md', className }: PriceProps) {
  const hasDiscount = product.discount > 0;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2', className)}>
      <span
        className={cn(
          'font-display font-bold tracking-tight',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-3xl'
        )}
      >
        {formatPrice(finalPrice(product))}
      </span>
      {hasDiscount && (
        <span
          className={cn(
            'text-muted-foreground line-through',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}
        >
          {formatPrice(product.price)}
        </span>
      )}
    </div>
  );
}
