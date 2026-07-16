import { Wrench } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function MaintenancePage() {
  usePageMeta('Em manutenção');

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand shadow-glow">
        <Wrench className="h-8 w-8 text-white" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">Voltamos já! 🛠️</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Estamos fazendo uma manutenção rápida para melhorar sua experiência. Tente novamente em
          alguns minutos.
        </p>
      </div>
    </div>
  );
}
