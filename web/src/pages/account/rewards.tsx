import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Gift, ShoppingBag, Sparkles, Star, UserPlus } from 'lucide-react';
import { loyaltyService } from '@/services/loyalty.service';
import { cn, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LevelKey, PointsEntry } from '@/types';

const LEVEL_STYLE: Record<LevelKey, { ring: string; text: string; from: string }> = {
  BRONZE: { ring: 'ring-amber-700/40', text: 'text-amber-700', from: 'from-amber-700/20' },
  SILVER: { ring: 'ring-zinc-400/50', text: 'text-zinc-400', from: 'from-zinc-400/20' },
  GOLD: { ring: 'ring-amber-400/60', text: 'text-amber-400', from: 'from-amber-400/25' },
  DIAMOND: { ring: 'ring-cyan-300/60', text: 'text-cyan-300', from: 'from-cyan-300/25' },
};

const REASON_META: Record<PointsEntry['reason'], { icon: typeof Star; label: string }> = {
  ORDER: { icon: ShoppingBag, label: 'Compra' },
  REVIEW: { icon: Star, label: 'Avaliação' },
  SIGNUP: { icon: UserPlus, label: 'Boas-vindas' },
  REDEEM: { icon: Gift, label: 'Resgate' },
};

const EARN_WAYS = [
  { icon: ShoppingBag, title: 'Compre', points: '1 pt / R$1', desc: 'A cada real gasto.' },
  { icon: Star, title: 'Avalie', points: '+50 pts', desc: 'Por avaliação publicada.' },
  { icon: UserPlus, title: 'Cadastre-se', points: '+100 pts', desc: 'Bônus de boas-vindas.' },
];

export default function RewardsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: () => loyaltyService.summary(),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const style = LEVEL_STYLE[data.level.key];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Recompensas</h1>

      {/* Level card */}
      <div className={cn('relative overflow-hidden rounded-3xl bg-zinc-950 p-6 text-white sm:p-8')}>
        <div className={cn('pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br blur-3xl', style.from, 'to-transparent')} />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Seu nível</p>
            <p className={cn('font-heading text-4xl uppercase sm:text-5xl', style.text)}>
              {data.level.label}
            </p>
            <p className="mt-1 text-sm text-white/70">
              <span className="font-bold text-white">{data.points.toLocaleString('pt-BR')}</span> pontos Sphere
            </p>
          </div>
          <span className={cn('flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-4', style.ring)}>
            <Award className={cn('h-10 w-10', style.text)} aria-hidden />
          </span>
        </div>

        {data.level.next !== null ? (
          <div className="relative mt-6">
            <div className="mb-1.5 flex justify-between text-xs text-white/60">
              <span>{data.level.label}</span>
              <span>Faltam {data.pointsToNext.toLocaleString('pt-BR')} pts para o próximo nível</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.progress}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full gradient-brand"
              />
            </div>
          </div>
        ) : (
          <p className="relative mt-6 flex items-center gap-2 text-sm text-cyan-300">
            <Sparkles className="h-4 w-4" aria-hidden /> Nível máximo alcançado. Você é lenda. 💎
          </p>
        )}
      </div>

      {/* How to earn */}
      <div className="grid gap-4 sm:grid-cols-3">
        {EARN_WAYS.map(({ icon: Icon, title, points, desc }) => (
          <Card key={title} className="p-5">
            <Icon className="mb-2.5 h-5 w-5 text-brand-500" aria-hidden />
            <p className="text-sm font-semibold">{title}</p>
            <p className="font-display text-lg font-bold text-brand-600 dark:text-brand-400">{points}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </Card>
        ))}
      </div>

      {/* Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Extrato de pontos</CardTitle>
        </CardHeader>
        <CardContent>
          {data.entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Seu extrato aparecerá aqui conforme você ganha pontos.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.entries.map((entry) => {
                const meta = REASON_META[entry.reason];
                const Icon = meta.icon;
                return (
                  <li key={entry.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                    </div>
                    <span
                      className={cn(
                        'font-display font-bold tabular-nums',
                        entry.amount >= 0 ? 'text-emerald-500' : 'text-red-500'
                      )}
                    >
                      {entry.amount >= 0 ? '+' : ''}
                      {entry.amount}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
