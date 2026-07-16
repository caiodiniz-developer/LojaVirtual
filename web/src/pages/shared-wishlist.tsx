import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { wishlistService } from '@/services/account.service';
import { usePageMeta } from '@/hooks/use-page-meta';
import { ProductGrid } from '@/features/products/product-grid';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function SharedWishlistPage() {
  const { token = '' } = useParams<{ token: string }>();
  usePageMeta('Lista de desejos compartilhada');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-wishlist', token],
    queryFn: () => wishlistService.shared(token),
    enabled: Boolean(token),
  });

  return (
    <div className="container py-10">
      {isLoading && <ProductGridSkeleton count={4} />}

      {(isError || (data && data.items.length === 0)) && (
        <EmptyState
          icon={Heart}
          title="Lista vazia ou não encontrada"
          description="Este link pode ter expirado ou a lista ainda não tem produtos."
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Lista de desejos
            </p>
            <h1 className="font-heading text-3xl uppercase sm:text-4xl">
              Os favoritos de {data.owner}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.items.length} {data.items.length === 1 ? 'produto' : 'produtos'} selecionados a dedo.
            </p>
          </div>
          <ProductGrid products={data.items.map((i) => i.product)} />
        </>
      )}
    </div>
  );
}
