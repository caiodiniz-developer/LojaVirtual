import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { formatDate, formatPrice } from '@/lib/utils';
import { StatCard } from '@/features/admin/stat-card';
import { OrdersByStatusChart, RevenueChart } from '@/features/admin/dashboard-charts';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.dashboard(),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua loja em tempo real.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Receita total" value={formatPrice(data.totals.revenue)} />
        <StatCard icon={ShoppingCart} label="Pedidos" value={String(data.totals.orders)} />
        <StatCard icon={Users} label="Clientes" value={String(data.totals.customers)} />
        <StatCard
          icon={data.totals.lowStock > 0 ? AlertTriangle : Package}
          label="Produtos"
          value={String(data.totals.products)}
          hint={data.totals.lowStock > 0 ? `${data.totals.lowStock} com estoque baixo` : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita — últimos 6 meses</CardTitle>
            <CardDescription>Pedidos pagos, em preparo, enviados e entregues.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueByMonth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos por status</CardTitle>
            <CardDescription>Distribuição atual de todos os pedidos.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersByStatusChart data={data.ordersByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos recentes</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Pedido</th>
                  <th className="pb-2 pr-4 font-medium">Cliente</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Data</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2.5 pr-4 font-mono text-xs">{order.code}</td>
                    <td className="max-w-32 truncate py-2.5 pr-4">{order.user.name}</td>
                    <td className="py-2.5 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-2.5 text-right font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mais vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-muted"
              >
                <span className="w-4 text-xs font-bold text-muted-foreground">{index + 1}</span>
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {product.images[0] && (
                    <Image src={product.images[0]} alt="" fill sizes="44px" className="object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{product.title}</span>
                  <span className="text-xs text-muted-foreground">{product.sold} vendidos</span>
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
