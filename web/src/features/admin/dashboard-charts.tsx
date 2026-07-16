import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/features/orders/order-status-badge';
import type { DashboardData } from '@/types';

const BRAND = '#6366f1';

interface TooltipPayload {
  value?: number | string;
  name?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  money,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  money?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">{money ? formatPrice(value) : `${value} pedidos`}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: DashboardData['revenueByMonth'] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="currentColor" className="text-border" strokeOpacity={0.5} />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={56}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => `R$${Math.round(v / 100000) / 10}k`}
          className="text-muted-foreground"
        />
        <Tooltip content={<ChartTooltip money />} cursor={{ stroke: BRAND, strokeOpacity: 0.3 }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={BRAND}
          strokeWidth={2}
          fill="url(#revenue-fill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersByStatusChart({ data }: { data: DashboardData['ordersByStatus'] }) {
  const rows = data.map((d) => ({ ...d, label: ORDER_STATUS_LABELS[d.status] }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="currentColor" className="text-border" strokeOpacity={0.5} />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={32}
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: BRAND, fillOpacity: 0.06 }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {rows.map((row) => (
            <Cell key={row.status} fill={BRAND} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
