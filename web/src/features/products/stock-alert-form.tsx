import { useState, type FormEvent } from 'react';
import { BellRing, Check } from 'lucide-react';
import { productService } from '@/services/product.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';

/** Shown on out-of-stock products: capture an e-mail to notify on restock. */
export function StockAlertForm({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await productService.subscribeStockAlert(productId, email);
      setDone(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        Pronto! Avisaremos você em <strong>{email}</strong> assim que voltar ao estoque.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <BellRing className="h-4 w-4 text-brand-500" aria-hidden />
        Esgotado — avise-me quando voltar
      </p>
      <div className="flex gap-2">
        <label htmlFor="stock-alert-email" className="sr-only">
          Seu e-mail
        </label>
        <input
          id="stock-alert-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm focus:border-brand-500 focus:outline-none"
        />
        <Button type="submit" isLoading={loading}>
          Avisar
        </Button>
      </div>
    </form>
  );
}
