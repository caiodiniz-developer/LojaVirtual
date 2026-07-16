import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Package, Sparkles, TicketPercent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/loyalty.service';
import { useAuth } from '@/hooks/use-auth';
import { cn, formatDateTime } from '@/lib/utils';
import type { Notification } from '@/types';

const ICONS = {
  ORDER: Package,
  POINTS: Sparkles,
  STOCK: TicketPercent,
  SYSTEM: Bell,
} as const;

function NotificationRow({ item, onGo }: { item: Notification; onGo: (link: string) => void }) {
  const Icon = ICONS[item.type];
  return (
    <button
      onClick={() => item.link && onGo(item.link)}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted',
        !item.read && 'bg-brand-500/5'
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{item.title}</span>
        <span className="block text-xs text-muted-foreground">{item.body}</span>
        <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
          {formatDateTime(item.createdAt)}
        </span>
      </span>
      {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
    </button>
  );
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!isAuthenticated) return null;

  const unread = data?.unread ?? 0;

  function go(link: string) {
    setOpen(false);
    navigate(link);
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) markRead.mutate();
        }}
        aria-label={`Notificações${unread > 0 ? ` (${unread} não lidas)` : ''}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl glass shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <p className="text-sm font-semibold">Notificações</p>
                {unread > 0 && (
                  <button
                    onClick={() => markRead.mutate()}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-400"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Marcar lidas
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto p-1.5">
                {data && data.items.length > 0 ? (
                  data.items.map((item) => <NotificationRow key={item.id} item={item} onGo={go} />)
                ) : (
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Nenhuma notificação ainda.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
