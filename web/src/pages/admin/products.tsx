import { useState } from 'react';
import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { adminProductService, productService } from '@/services/product.service';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { finalPrice, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<Product | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'admin', page, debouncedSearch],
    queryFn: () =>
      productService.listAdmin({ page, limit: 10, search: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminProductService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído');
      setDeleting(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Produtos</h1>
        <Button size="sm">
          <Link href="/admin/products/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo produto
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar produtos…"
          aria-label="Buscar produtos"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Produto</th>
                <th className="p-3 font-medium">Categoria</th>
                <th className="p-3 font-medium">Preço</th>
                <th className="p-3 font-medium">Estoque</th>
                <th className="p-3 font-medium">Vendidos</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {data?.data.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </span>
                      <span className="max-w-56 truncate font-medium">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{product.category?.name}</td>
                  <td className="p-3 tabular-nums">
                    {formatPrice(finalPrice(product))}
                    {product.discount > 0 && (
                      <span className="ml-1.5 text-xs text-emerald-500">-{product.discount}%</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={product.stock <= 5 ? 'font-semibold text-amber-500' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-3 tabular-nums">{product.sold}</td>
                  <td className="p-3">
                    <Badge variant={product.isActive ? 'success' : 'outline'}>
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        aria-label={`Editar ${product.title}`}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleting(product)}
                        aria-label={`Excluir ${product.title}`}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Excluir produto">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong className="text-foreground">{deleting?.title}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              isLoading={removeMutation.isPending}
              onClick={() => deleting && removeMutation.mutate(deleting.id)}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
