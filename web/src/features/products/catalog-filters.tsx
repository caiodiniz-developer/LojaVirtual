import { SlidersHorizontal, X } from 'lucide-react';
import { useCategories } from '@/hooks/use-products';
import type { ProductFilters } from '@/services/product.service';
import { RatingStars } from '@/components/ui/rating-stars';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CatalogFiltersProps {
  filters: ProductFilters;
  onChange: (partial: Partial<ProductFilters>) => void;
  onClear: () => void;
}

export function CatalogFilters({ filters, onChange, onClear }: CatalogFiltersProps) {
  const { data: categories } = useCategories();

  const hasFilters = Boolean(
    filters.category || filters.minPrice || filters.maxPrice || filters.minRating || filters.inStock || filters.onSale
  );

  return (
    <aside aria-label="Filtros" className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtros
        </h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-xs">
            <X className="h-3.5 w-3.5" /> Limpar
          </Button>
        )}
      </div>

      {/* Categories */}
      <fieldset className="space-y-2.5">
        <legend className="mb-2 text-sm font-semibold">Categorias</legend>
        <button
          onClick={() => onChange({ category: undefined })}
          className={cn(
            'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
            !filters.category ? 'bg-brand-500/10 font-medium text-brand-600 dark:text-brand-400' : 'text-muted-foreground hover:bg-muted'
          )}
        >
          Todas
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            onClick={() => onChange({ category: category.slug })}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
              filters.category === category.slug
                ? 'bg-brand-500/10 font-medium text-brand-600 dark:text-brand-400'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {category.name}
            {category._count && (
              <span className="text-xs text-muted-foreground/70">{category._count.products}</span>
            )}
          </button>
        ))}
      </fieldset>

      {/* Price range (in reais, converted to cents) */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Preço</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="min-price">Preço mínimo</label>
          <input
            id="min-price"
            type="number"
            min={0}
            placeholder="Mín"
            value={filters.minPrice != null ? filters.minPrice / 100 : ''}
            onChange={(e) =>
              onChange({ minPrice: e.target.value ? Math.round(Number(e.target.value) * 100) : undefined })
            }
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <label className="sr-only" htmlFor="max-price">Preço máximo</label>
          <input
            id="max-price"
            type="number"
            min={0}
            placeholder="Máx"
            value={filters.maxPrice != null ? filters.maxPrice / 100 : ''}
            onChange={(e) =>
              onChange({ maxPrice: e.target.value ? Math.round(Number(e.target.value) * 100) : undefined })
            }
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </fieldset>

      {/* Rating */}
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-semibold">Avaliação mínima</legend>
        {[4, 3, 2].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange({ minRating: filters.minRating === rating ? undefined : rating })}
            aria-pressed={filters.minRating === rating}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 transition-colors',
              filters.minRating === rating ? 'bg-brand-500/10' : 'hover:bg-muted'
            )}
          >
            <RatingStars rating={rating} size="sm" />
            <span className="text-xs text-muted-foreground">ou mais</span>
          </button>
        ))}
      </fieldset>

      {/* Toggles */}
      <fieldset className="space-y-3">
        <legend className="sr-only">Outros filtros</legend>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) => onChange({ inStock: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-border accent-brand-600"
          />
          Somente em estoque
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(filters.onSale)}
            onChange={(e) => onChange({ onSale: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-border accent-brand-600"
          />
          Em promoção
        </label>
      </fieldset>
    </aside>
  );
}
