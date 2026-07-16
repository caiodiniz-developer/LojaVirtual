import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Home, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { addressService } from '@/services/account.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import type { Address } from '@/types';
import { AddressForm } from '@/features/checkout/address-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.list(),
  });

  const removeAddress = useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Endereço removido');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Endereços</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Novo endereço
        </Button>
      </div>

      {isLoading &&
        Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}

      {addresses && addresses.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="Nenhum endereço cadastrado"
          description="Adicione um endereço para agilizar seus checkouts."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Adicionar endereço
            </Button>
          }
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {addresses?.map((address) => (
          <div key={address.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Home className="h-4 w-4 text-brand-500" aria-hidden />
                {address.label}
                {address.isDefault && <Badge variant="brand">Padrão</Badge>}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(address)}
                  aria-label={`Editar ${address.label}`}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeAddress.mutate(address.id)}
                  aria-label={`Remover ${address.label}`}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ''}
              <br />
              {address.district} · {address.city}/{address.state}
              <br />
              CEP {address.zipCode}
            </p>
          </div>
        ))}
      </div>

      <Modal
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Editar endereço' : 'Novo endereço'}
      >
        <AddressForm
          address={editing ?? undefined}
          onSuccess={() => {
            setCreating(false);
            setEditing(null);
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}
