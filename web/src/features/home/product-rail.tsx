import { useProducts } from '@/hooks/use-products';
import type { ProductFilters } from '@/services/product.service';
import { ProductGrid } from '@/features/products/product-grid';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { SectionHeader } from './section-header';

interface ProductRailProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  filters: ProductFilters;
}

/** Reusable home-page section: header + product grid driven by API filters. */
export function ProductRail({ eyebrow, title, description, href, filters }: ProductRailProps) {
  const { data, isLoading, isError } = useProducts({ limit: 4, ...filters });

  if (isError || (data && data.data.length === 0)) return null;

  return (
    <section className="container py-12">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        href={href}
      />
      {isLoading ? <ProductGridSkeleton count={4} /> : <ProductGrid products={data!.data} />}
    </section>
  );
}
