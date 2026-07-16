import { motion } from 'framer-motion';
import { Check, CreditCard, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const STEPS = [
  { key: 'PAID', label: 'Confirmado', icon: CreditCard },
  { key: 'PROCESSING', label: 'Preparando', icon: Package },
  { key: 'SHIPPED', label: 'Enviado', icon: Truck },
  { key: 'DELIVERED', label: 'Entregue', icon: Home },
] as const;

const ORDER: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER.indexOf(status);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const stepIndex = ORDER.indexOf(step.key);
          const done = currentIndex >= stepIndex;
          const active = status === step.key;
          const Icon = step.icon;

          return (
            <li key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <motion.span
                  initial={false}
                  animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                  transition={active ? { repeat: Infinity, duration: 2 } : undefined}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors',
                    done
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {done && !active ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </motion.span>
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    done ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="mx-1 mb-6 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: currentIndex > stepIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="h-full bg-brand-500"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
