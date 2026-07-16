import { lazy, Suspense, useEffect, useState } from 'react';
import Link from '@/components/common/link';
import { ChevronRight, Heart, Package, RotateCcw, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useProduct, useRelatedProducts } from '@/hooks/use-products';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store';
import { useIsWished, useToggleWishlist } from '@/hooks/use-wishlist';
import { toast } from '@/stores/toast-store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/ui/price';
import { RatingStars } from '@/components/ui/rating-stars';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductGallery } from './product-gallery';
import { ShareButton } from './share-button';
import { ReviewsSection } from './reviews-section';
import { ProductGrid } from './product-grid';
import { RecentlyViewed } from './recently-viewed';
import { ShippingEstimator } from './shipping-estimator';
import { StockAlertForm } from './stock-alert-form';
import { SocialProof } from './social-proof';
import { BoughtTogether } from './bought-together';
import { SectionHeader } from '@/features/home/section-header';
import NotFoundPage from '@/pages/not-found';
import { finalPrice } from '@/lib/utils';

// Recharts only downloads when someone actually opens a product page
const PriceHistoryChart = lazy(() => import('./price-history-chart'));

const guarantees = [
  { icon: Package, label: 'Envio em até 24h úteis' },
  { icon: RotateCcw, label: 'Troca grátis em 30 dias' },
  { icon: ShieldCheck, label: 'Garantia de 12 meses' },
];

export function ProductDetail({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: related } = useRelatedProducts(slug);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add);
  const { toggle } = useToggleWishlist();
  const wished = useIsWished(product?.id ?? '');

  useEffect(() => {
    if (product) addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  if (isError) return <NotFoundPage />;

  if (isLoading || !product) {
    return (
      <div className="container grid gap-12 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  function handleAddToCart() {
    if (!product || outOfStock) return;
    addItem(product, quantity);
    toast.success('Adicionado ao carrinho 🛍️', `${quantity}x ${product.title}`);
    setCartOpen(true);
  }

  return (
    <div className="container space-y-16 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">Início</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/products" className="transition-colors hover:text-foreground">Produtos</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span aria-current="page" className="truncate text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {product.discount > 0 && <Badge variant="gradient">-{product.discount}% OFF</Badge>}
              {product.isFeatured && <Badge variant="warning">Destaque</Badge>}
              {product.sold > 20 && <Badge variant="brand">🔥 Mais vendido</Badge>}
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
              {product.title}
            </h1>
            <RatingStars rating={product.rating} count={product.reviewCount} />
            <SocialProof productId={product.id} />
          </div>

          <Price product={product} size="lg" />

          <p className="leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Real-time (simulated) stock indicator */}
          <p
            aria-live="polite"
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              outOfStock ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-emerald-500'
            )}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
                  outOfStock ? 'bg-red-500' : product.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
              />
              <span
                className={cn(
                  'relative inline-flex h-2.5 w-2.5 rounded-full',
                  outOfStock ? 'bg-red-500' : product.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
              />
            </span>
            {outOfStock
              ? 'Produto esgotado'
              : product.stock <= 5
                ? `Últimas ${product.stock} unidades!`
                : `${product.stock} unidades em estoque`}
          </p>

          {outOfStock ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-56">
                <StockAlertForm productId={product.id} />
              </div>
              <button
                onClick={() => toggle(product.id)}
                aria-label={wished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                aria-pressed={wished}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border transition-all hover:scale-105 hover:bg-muted"
              >
                <Heart className={cn('h-5 w-5 transition-colors', wished && 'fill-red-500 text-red-500')} />
              </button>
              <ShareButton title={product.title} />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={Math.min(product.stock, 99)}
              />
              <Button size="lg" onClick={handleAddToCart} className="flex-1 min-w-44">
                <ShoppingBag className="h-4 w-4" />
                Adicionar ao carrinho
              </Button>
              <button
                onClick={() => toggle(product.id)}
                aria-label={wished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                aria-pressed={wished}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border transition-all hover:scale-105 hover:bg-muted"
              >
                <Heart className={cn('h-5 w-5 transition-colors', wished && 'fill-red-500 text-red-500')} />
              </button>
              <ShareButton title={product.title} />
            </div>
          )}

          <ShippingEstimator subtotal={finalPrice(product) * quantity} />

          <ul className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-5 sm:grid-cols-3">
            {guarantees.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                <Icon className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
          <PriceHistoryChart productId={product.id} />
        </Suspense>
        {related && <BoughtTogether product={product} related={related} />}
      </div>

      <ReviewsSection productId={product.id} />

      {related && related.length > 0 && (
        <section>
          <SectionHeader eyebrow="Você também pode gostar" title="Produtos relacionados" />
          <ProductGrid products={related} />
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
