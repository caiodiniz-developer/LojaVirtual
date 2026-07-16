import { useState, type FormEvent } from 'react';
import Image from '@/components/common/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useCategories } from '@/hooks/use-products';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  function openModal(category?: Category) {
    setEditing(category ?? null);
    setCreating(!category);
    setName(category?.name ?? '');
    setDescription(category?.description ?? '');
    setImage(category?.image ?? '');
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = {
        name,
        description: description || undefined,
        image: image || undefined,
      };
      return editing
        ? adminService.updateCategory(editing.id, input)
        : adminService.createCategory(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editing ? 'Categoria atualizada' : 'Categoria criada');
      closeModal();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminService.removeCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Categorias</h1>
        <Button size="sm" onClick={() => openModal()}>
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {categories && categories.length === 0 && (
        <EmptyState icon={Tags} title="Nenhuma categoria" description="Crie a primeira categoria da loja." />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
              {category.image && (
                <Image src={category.image} alt="" fill sizes="56px" className="object-cover" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{category.name}</p>
              <p className="text-xs text-muted-foreground">
                {category._count?.products ?? 0} produtos
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => openModal(category)}
                aria-label={`Editar ${category.name}`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeMutation.mutate(category.id)}
                aria-label={`Excluir ${category.name}`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={creating || Boolean(editing)}
        onClose={closeModal}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-20"
          />
          <Input
            label="URL da imagem (opcional)"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://…"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
