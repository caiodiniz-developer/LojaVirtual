import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronRight, Search } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerDetailDrawer } from '@/features/admin/customer-detail-drawer';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch],
    queryFn: () => adminService.users({ page, search: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Clique em um cliente para ver endereços, compras e previsões de entrega.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome ou e-mail…"
          aria-label="Buscar usuários"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Usuário</th>
                <th className="p-3 font-medium">Perfil</th>
                <th className="p-3 font-medium">Pedidos</th>
                <th className="p-3 font-medium">Cadastro</th>
                <th className="p-3" aria-hidden />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {data?.data.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedId(user.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(user.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver detalhes de ${user.name}`}
                  className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                        {getInitials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={user.role === 'ADMIN' ? 'brand' : 'default'}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                    </Badge>
                  </td>
                  <td className="p-3 tabular-nums">{user._count.orders}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="p-3 text-right">
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}

      <CustomerDetailDrawer userId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
