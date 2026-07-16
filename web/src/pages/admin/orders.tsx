import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/features/orders/order-status-badge';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { OrderStatus } from '@/types';

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => orderService.listAll({ page, status: statusFilter || undefined }),
    placeholderData: keepPreviousData,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Status atualizado');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        <div className="w-48">
          <Select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | '');
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
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
                <th className="p-3 font-medium">Pedido</th>
                <th className="p-3 font-medium">Cliente</th>
                <th className="p-3 font-medium">Data</th>
                <th className="p-3 font-medium">Itens</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {data?.data.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-semibold">{order.code}</td>
                  <td className="p-3">
                    <p className="max-w-40 truncate font-medium">{order.user?.name}</p>
                    <p className="max-w-40 truncate text-xs text-muted-foreground">
                      {order.user?.email}
                    </p>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="p-3 tabular-nums">{order.items.length}</td>
                  <td className="p-3 font-medium tabular-nums">{formatPrice(order.total)}</td>
                  <td className="p-3">
                    <select
                      aria-label={`Status do pedido ${order.code}`}
                      value={order.status}
                      disabled={updateStatus.isPending}
                      onChange={(e) =>
                        updateStatus.mutate({ id: order.id, status: e.target.value as OrderStatus })
                      }
                      className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-medium focus:border-brand-500 focus:outline-none"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
