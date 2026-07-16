import { useState } from 'react';
import Image from '@/components/common/image';
import { useRouter } from '@/lib/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { adminProductService, type UpsertProductInput } from '@/services/product.service';
import { useCategories } from '@/hooks/use-products';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

const productSchema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string().min(10, 'Descreva melhor o produto'),
  priceReais: z.coerce.number().positive('Informe o preço'),
  discount: z.coerce.number().int().min(0).max(90),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, 'Escolha uma categoria'),
  tags: z.string(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          title: product.title,
          description: product.description,
          priceReais: product.price / 100,
          discount: product.discount,
          stock: product.stock,
          categoryId: product.categoryId,
          tags: product.tags.join(', '),
          isFeatured: product.isFeatured,
          isActive: product.isActive,
        }
      : { discount: 0, stock: 0, tags: '', isFeatured: false, isActive: true },
  });

  const mutation = useMutation({
    mutationFn: (input: UpsertProductInput) =>
      product ? adminProductService.update(product.id, input) : adminProductService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(product ? 'Produto atualizado!' : 'Produto cadastrado!');
      router.push('/admin/products');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await adminProductService.uploadImages(Array.from(files));
      setImages((prev) => [...prev, ...urls].slice(0, 6));
      toast.success('Imagens enviadas!');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  function addImageUrl() {
    try {
      new URL(imageUrl);
      setImages((prev) => [...prev, imageUrl].slice(0, 6));
      setImageUrl('');
    } catch {
      toast.error('URL de imagem inválida');
    }
  }

  function onSubmit(values: ProductFormValues) {
    if (images.length === 0) {
      toast.error('Adicione pelo menos uma imagem');
      return;
    }
    mutation.mutate({
      title: values.title,
      description: values.description,
      price: Math.round(values.priceReais * 100),
      discount: values.discount,
      stock: values.stock,
      categoryId: values.categoryId,
      tags: values.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      images,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5" noValidate>
      <Input label="Título" error={errors.title?.message} {...register('title')} />
      <Textarea label="Descrição" error={errors.description?.message} {...register('description')} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Preço (R$)"
          type="number"
          step="0.01"
          min="0"
          error={errors.priceReais?.message}
          {...register('priceReais')}
        />
        <Input
          label="Desconto (%)"
          type="number"
          min="0"
          max="90"
          error={errors.discount?.message}
          {...register('discount')}
        />
        <Input
          label="Estoque"
          type="number"
          min="0"
          error={errors.stock?.message}
          {...register('stock')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Categoria" error={errors.categoryId?.message} {...register('categoryId')}>
          <option value="">Selecione…</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Input
          label="Tags (separadas por vírgula)"
          placeholder="fone, bluetooth, audio"
          {...register('tags')}
        />
      </div>

      {/* Images */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Imagens ({images.length}/6)</legend>
        <div className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative h-24 w-24 overflow-hidden rounded-xl bg-muted">
              <Image src={url} alt={`Imagem ${index + 1}`} fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                aria-label="Remover imagem"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-brand-500 hover:text-brand-500">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
            <span className="text-[10px] font-medium">Upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
        <div className="flex gap-2">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="…ou cole a URL de uma imagem"
            className="h-10 flex-1 rounded-xl border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addImageUrl} className="h-10">
            Adicionar URL
          </Button>
        </div>
      </fieldset>

      <div className="flex gap-6">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" {...register('isFeatured')} />
          Produto em destaque
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" {...register('isActive')} />
          Ativo na loja
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" isLoading={mutation.isPending}>
          {product ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
