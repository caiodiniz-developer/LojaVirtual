import { ProductForm } from '@/features/admin/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Novo produto</h1>
      <ProductForm />
    </div>
  );
}
