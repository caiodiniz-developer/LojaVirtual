import { useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUp, Github, Instagram, Linkedin, Lock, Send, Twitter } from 'lucide-react';
import Link from '@/components/common/link';
import { Logo } from './logo';
import { SplitReveal } from '@/components/common/split-reveal';
import { Magnetic } from '@/components/common/magnetic';
import { Reveal } from '@/components/common/reveal';
import { newsletterService } from '@/services/account.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';

const sections = [
  {
    title: 'Loja',
    links: [
      { label: 'Todos os produtos', href: '/products' },
      { label: 'Ofertas', href: '/products?onSale=true' },
      { label: 'Mais vendidos', href: '/products?sort=bestselling' },
      { label: 'Lançamentos', href: '/products?sort=newest' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Minha conta', href: '/account' },
      { label: 'Meus pedidos', href: '/account/orders' },
      { label: 'Favoritos', href: '/account/wishlist' },
      { label: 'Endereços', href: '/account/addresses' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Sobre nós', href: '/#' },
      { label: 'Política de privacidade', href: '/#' },
      { label: 'Termos de uso', href: '/#' },
      { label: 'Trocas e devoluções', href: '/#' },
    ],
  },
];

const socials = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Github, label: 'GitHub', href: 'https://github.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
];

const paymentMethods = ['Pix', 'Visa', 'Mastercard', 'Boleto', 'Elo'];

export function Footer() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const { message } = await newsletterService.subscribe(email);
      toast.success(message);
      setEmail('');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="overflow-hidden border-t border-border bg-muted/30">
      {/* Big closing CTA */}
      <div className="border-b border-border">
        <div className="container flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
          <h2 className="font-heading text-4xl uppercase leading-[0.95] sm:text-6xl">
            <SplitReveal text="Pronto para o" stagger={0.05} />
            <br />
            <span className="gradient-text">
              <SplitReveal text="próximo nível?" stagger={0.05} delay={0.2} />
            </span>
          </h2>
          <Magnetic>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full gradient-brand px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-glow transition-transform active:scale-[0.98]"
            >
              Explorar a loja
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
        </div>
      </div>

      {/* Main grid */}
      <div className="container grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,0.8fr)_1.3fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Equipamento e estilo para quem corre atrás. Descubra o novo em cada compra.
          </p>
          <div className="flex gap-2">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:text-brand-500 hover:shadow-glow"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Loja online · pedidos em até 24h úteis
          </p>
        </div>

        {sections.map((section) => (
          <nav key={section.title} aria-label={section.title}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {section.title}
            </h3>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="inline-block h-px w-0 bg-brand-500 transition-all duration-300 group-hover:w-3" aria-hidden />
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Receba os drops
          </h3>
          <p className="text-sm text-muted-foreground">
            Lançamentos e ofertas exclusivas, sem spam. Cupom de 10% na primeira compra.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <label htmlFor="footer-newsletter" className="sr-only">
              Seu e-mail
            </label>
            <input
              id="footer-newsletter"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-4 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              aria-label="Assinar newsletter"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand text-white shadow-soft transition-all hover:shadow-glow disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Trust bar */}
      <Reveal className="container flex flex-wrap items-center justify-between gap-4 border-t border-border py-5">
        <div className="flex flex-wrap items-center gap-2">
          {paymentMethods.map((method) => (
            <span
              key={method}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              {method}
            </span>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          Compra 100% segura · pagamento simulado para demonstração
        </p>
      </Reveal>

      {/* Giant wordmark: letters rise one by one as the footer enters */}
      <div aria-hidden className="container overflow-hidden pb-2 pt-8">
        <SplitReveal
          text="SHOPSPHERE"
          by="chars"
          stagger={0.05}
          className="block select-none text-center font-heading text-[12.5vw] uppercase leading-none text-foreground/10"
        />
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ShopSphere. Projeto de portfólio — pagamentos simulados.</p>
          <div className="flex items-center gap-4">
            <p>Feito com React 19, Express e Prisma</p>
            <Magnetic strength={0.5}>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Voltar ao topo"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-brand-500 hover:text-brand-500"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  );
}
