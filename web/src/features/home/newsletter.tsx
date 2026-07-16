import { useState, type FormEvent } from 'react';
import { Mail, Sparkles, ShieldCheck, Gift } from 'lucide-react';
import { newsletterService } from '@/services/account.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { message } = await newsletterService.subscribe(email);
      toast.success(message);
      setEmail('');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-10 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 via-purple-500/10 to-transparent" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/80 backdrop-blur">
              <Sparkles className="h-4 w-4 text-brand-300" />
              Oferta exclusiva
            </div>

            <h2 className="max-w-xl font-heading text-4xl uppercase leading-[0.95] sm:text-5xl md:text-6xl">
              Ganhe 10% na sua primeira compra
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
              Entre para a nossa lista VIP e receba lançamentos, promoções antecipadas e seu cupom
              exclusivo direto no e-mail.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-white/80">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <Gift className="h-4 w-4 text-brand-300" />
                Cupom BEMVINDO10
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-brand-300" />
                Sem spam
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md sm:p-5"
          >
            <label
              htmlFor="newsletter-email"
              className="mb-3 block text-sm font-semibold text-white"
            >
              Receba seu cupom agora
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />

              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu melhor e-mail"
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-brand-300 focus:bg-black/35 focus:ring-4 focus:ring-brand-400/20"
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="mt-3 h-14 w-full rounded-2xl bg-white font-bold uppercase tracking-wide text-zinc-950 transition hover:scale-[1.01] hover:bg-white/90 hover:shadow-none active:scale-[0.99]"
            >
              Quero meu cupom
            </Button>

            <p className="mt-3 text-center text-xs text-white/50">
              Ao assinar, você concorda em receber novidades e ofertas da loja.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
