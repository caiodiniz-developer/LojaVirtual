import { usePageMeta } from '@/hooks/use-page-meta';
import { Catalog } from '@/features/products/catalog';

export default function ProductsPage() {
  usePageMeta(
    'Produtos',
    'Explore o catálogo completo da ShopSphere: eletrônicos, moda, casa, beleza e muito mais com filtros inteligentes.'
  );

  return <Catalog />;
}
