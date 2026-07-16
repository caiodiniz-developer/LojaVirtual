import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, TicketPercent, Trash2 } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<Coupon['type']>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minSubtotal, setMinSubtotal] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminService.coupons(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });

  const createMutation = useMutation({
    mutationFn: () =>
      adminService.createCoupon({
        code,
        type,
        value: type === 'PERCENTAGE' ? Number(value) : Math.round(Number(value) * 100),
        minSubtotal: minSubtotal ? Math.round(Number(minSubtotal) * 100) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Cupom criado!');
      setCreating(false);
      setCode('');
      setValue('');
      setMinSubtotal('');
      setMaxUses('');
      setExpiresAt('');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const toggleMutation = useMutation({
    mutationFn: (coupon: Coupon) =>
      adminService.updateCoupon(coupon.id, { isActive: !coupon.isActive }),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminService.removeCoupon(id),
    onSuccess: () => {
      invalidate();
      toast.success('Cupom excluído');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Cupons</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Novo cupom
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {coupons && coupons.length === 0 && (
        <EmptyState
          icon={TicketPercent}
          title="Nenhum cupom"
          description="Crie cupons de desconto para suas campanhas."
        />
      )}

      {coupons && coupons.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Código</th>
                <th className="p-3 font-medium">Desconto</th>
                <th className="p-3 font-medium">Pedido mínimo</th>
                <th className="p-3 font-medium">Usos</th>
                <th className="p-3 font-medium">Validade</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-bold">{coupon.code}</td>
                  <td className="p-3 font-medium">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {coupon.minSubtotal ? formatPrice(coupon.minSubtotal) : '—'}
                  </td>
                  <td className="p-3 tabular-nums">
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Sem validade'}
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleMutation.mutate(coupon)} aria-label="Alternar status">
                      <Badge variant={coupon.isActive ? 'success' : 'outline'}>
                        {coupon.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeMutation.mutate(coupon.id)}
                        aria-label={`Excluir ${coupon.code}`}
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

      <Modal open={creating} onClose={() => setCreating(false)} title="Novo cupom">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Código"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="PROMO10"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo"
              value={type}
              onChange={(e) => setType(e.target.value as Coupon['type'])}
            >
              <option value="PERCENTAGE">Porcentagem (%)</option>
              <option value="FIXED">Valor fixo (R$)</option>
            </Select>
            <Input
              label={type === 'PERCENTAGE' ? 'Desconto (%)' : 'Desconto (R$)'}
              type="number"
              required
              min="1"
              step={type === 'PERCENTAGE' ? '1' : '0.01'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pedido mínimo (R$, opcional)"
              type="number"
              min="0"
              step="0.01"
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
            />
            <Input
              label="Limite de usos (opcional)"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
          <Input
            label="Validade (opcional)"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Criar cupom
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
