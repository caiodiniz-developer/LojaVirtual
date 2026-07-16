import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from '@/lib/navigation';
import { Loader2, PackageSearch, SlidersHorizontal } from 'lucide-react';
import { useInfiniteProducts } from '@/hooks/use-products';
import type { ProductFilters } from '@/services/product.service';
import { ProductGrid } from './product-grid';
import { CatalogFilters } from './catalog-filters';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

function parseFilters(params: URLSearchParams): ProductFilters {
  return {
    search: params.get('search') ?? undefined,
    category: params.get('category') ?? undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    inStock: params.get('inStock') === 'true' || undefined,
    onSale: params.get('onSale') === 'true' || undefined,
    featured: params.get('featured') === 'true' || undefined,
    sort: (params.get('sort') as ProductFilters['sort']) ?? 'newest',
  };
}

export function Catalog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const updateFilters = useCallback(
    (partial: Partial<ProductFilters>) => {
      const next = { ...filters, ...partial };
      const params = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== false) {
          params.set(key, String(value));
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, pathname, router]
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteProducts({ ...filters, limit: 12 });

  const products = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const total = data?.pages[0]?.meta.total ?? 0;

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && !isFetchingNextPage && fetchNextPage(),
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {filters.search ? `Resultados para “${filters.search}”` : 'Todos os produtos'}
        </h1>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {isLoading ? 'Carregando…' : `${total} produto${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <CatalogFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </Button>
            <div className="ml-auto w-52">
              <Select
                aria-label="Ordenar por"
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value as ProductFilters['sort'] })}
              >
                <option value="newest">Mais recentes</option>
                <option value="bestselling">Mais vendidos</option>
                <option value="rating">Melhor avaliados</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="discount">Maior desconto</option>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Nenhum produto encontrado"
              description="Tente ajustar os filtros ou buscar por outro termo."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid products={products} />
              <div ref={sentinelRef} aria-hidden />
              {isFetchingNextPage && (
                <div className="flex justify-center py-6" role="status" aria-label="Carregando mais produtos">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                </div>
              )}
              {!hasNextPage && products.length >= 12 && (
                <p className="pb-2 text-center text-xs text-muted-foreground">
                  Você chegou ao fim — {total} produtos exibidos
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filtros"
        side="left"
      >
        <div className="p-5">
          <CatalogFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />
        </div>
      </Drawer>
    </div>
  );
}
