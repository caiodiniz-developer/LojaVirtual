import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  max = 99,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-border',
        size === 'sm' ? 'h-8' : 'h-11',
        className
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={cn(
          'flex items-center justify-center transition-colors hover:bg-muted disabled:opacity-40',
          size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        aria-live="polite"
        className={cn('min-w-8 text-center font-medium tabular-nums', size === 'sm' ? 'text-xs' : 'text-sm')}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={cn(
          'flex items-center justify-center transition-colors hover:bg-muted disabled:opacity-40',
          size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
