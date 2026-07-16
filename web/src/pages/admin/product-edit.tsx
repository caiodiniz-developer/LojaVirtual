import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { ProductForm } from '@/features/admin/product-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProductPage() {
  const { id = '' } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', 'admin', id],
    queryFn: () => productService.getById(id),
    enabled: Boolean(id),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Editar produto</h1>
      {isLoading || !product ? (
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <ProductForm product={product} />
      )}
    </div>
  );
}
