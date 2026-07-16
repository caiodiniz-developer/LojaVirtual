import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import Link from '@/components/common/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { wishlistService } from '@/services/account.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { ProductGrid } from '@/features/products/product-grid';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { data: items, isLoading } = useWishlist();
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    setSharing(true);
    try {
      const { token } = await wishlistService.share();
      const url = `${window.location.origin}/wishlist/${token}`;
      if (navigator.share) {
        await navigator.share({ title: 'Minha lista de desejos', url }).catch(() => undefined);
      } else {
        await navigator.clipboard.writeText(url);
      }
      toast.success('Link da lista copiado!', 'Compartilhe com quem quiser.');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Favoritos</h1>
        {items && items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleShare} isLoading={sharing}>
            <Share2 className="h-4 w-4" /> Compartilhar lista
          </Button>
        )}
      </div>

      {isLoading && <ProductGridSkeleton count={4} />}

      {items && items.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Sua lista de desejos está vazia"
          description="Toque no coração dos produtos que você ama para salvá-los aqui."
          action={
            <Button>
              <Link href="/products">Descobrir produtos</Link>
            </Button>
          }
        />
      )}

      {items && items.length > 0 && <ProductGrid products={items.map((i) => i.product)} />}
    </div>
  );
}
