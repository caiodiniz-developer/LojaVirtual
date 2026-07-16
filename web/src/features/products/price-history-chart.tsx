import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BadgeCheck, TrendingDown } from 'lucide-react';
import { productService } from '@/services/product.service';
import { cn, formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const BRAND = '#6366f1';
const RANGES = [
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
  { days: 365, label: '1 ano' },
] as const;

interface TooltipPayload {
  value?: number | string;
}

function PriceTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold">
        {new Date(`${label}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
      </p>
      <p className="text-muted-foreground">{formatPrice(Number(payload[0].value ?? 0))}</p>
    </div>
  );
}

export default function PriceHistoryChart({ productId }: { productId: string }) {
  const [days, setDays] = useState<30 | 90 | 365>(90);

  const { data, isLoading } = useQuery({
    queryKey: ['price-history', productId, days],
    queryFn: () => productService.priceHistory(productId, days),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <section
      aria-labelledby="price-history-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="price-history-heading" className="flex items-center gap-2 font-display text-base font-semibold">
          <TrendingDown className="h-4 w-4 text-brand-500" aria-hidden />
          Histórico de preço
        </h2>
        <div role="tablist" aria-label="Período" className="flex gap-1 rounded-xl bg-muted p-1">
          {RANGES.map((range) => (
            <button
              key={range.days}
              role="tab"
              aria-selected={days === range.days}
              onClick={() => setDays(range.days)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                days === range.days
                  ? 'bg-card shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-44 w-full" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={176}>
            <AreaChart data={data.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                minTickGap={48}
                tickFormatter={(value: string) =>
                  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                }
                className="text-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={52}
                domain={['dataMin - 1000', 'dataMax + 1000']}
                tick={{ fontSize: 10 }}
                tickFormatter={(value: number) => `R$${Math.round(value / 100)}`}
                className="text-muted-foreground"
              />
              <Tooltip content={<PriceTooltip />} cursor={{ stroke: BRAND, strokeOpacity: 0.35 }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={BRAND}
                strokeWidth={2}
                fill="url(#price-fill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {data.isLowest ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Menor preço dos últimos 90 dias
              </span>
            ) : (
              <>
                Menor preço dos últimos 90 dias:{' '}
                <strong className="text-foreground">{formatPrice(data.lowest90)}</strong>
              </>
            )}
          </p>
        </>
      )}
    </section>
  );
}
