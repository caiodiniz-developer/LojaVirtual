import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-6 w-6' };

export function RatingStars({
  rating,
  count,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className="flex items-center gap-0.5"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Avaliação: ${rating} de 5 estrelas`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          const star = (
            <Star
              key={i}
              className={cn(
                sizes[size],
                'transition-colors',
                filled ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/40',
                interactive && 'cursor-pointer hover:scale-110'
              )}
              aria-hidden
            />
          );
          return interactive ? (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={i + 1 === Math.round(rating)}
              aria-label={`${i + 1} estrela${i > 0 ? 's' : ''}`}
              onClick={() => onChange?.(i + 1)}
            >
              {star}
            </button>
          ) : (
            star
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
