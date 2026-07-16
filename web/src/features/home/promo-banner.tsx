import { useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, BadgeCheck, Crown, Percent, Sparkles, Truck } from 'lucide-react';
import Link from '@/components/common/link';
import { useAuth } from '@/hooks/use-auth';
import { SplitReveal } from '@/components/common/split-reveal';
import { Magnetic } from '@/components/common/magnetic';
import { Reveal, RevealItem } from '@/components/common/reveal';

const BG = '/bg-promo.mp4';

const perks = [
  { icon: Truck, title: 'Frete grátis sempre', text: 'Em todo pedido, sem valor mínimo.' },
  { icon: Percent, title: 'Acesso antecipado', text: '24h na frente em toda promoção.' },
  { icon: Crown, title: 'Drops exclusivos', text: 'Produtos que não chegam à loja aberta.' },
  { icon: Sparkles, title: 'Aniversário premiado', text: 'Cupom de presente todo ano.' },
];

/** Glassmorphic membership card that tilts in 3D following the pointer. */
function MemberCard({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 160, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 160, damping: 18 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 22);
    rotateX.set(-(py - 0.5) * 16);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
        style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
        className="relative mx-auto aspect-[8/5] w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-lift backdrop-blur-xl will-change-transform sm:p-8"
      >
        {/* Holographic glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500/50 via-violet-500/35 to-fuchsia-500/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-brand-500/25 blur-3xl"
        />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="font-heading text-lg uppercase tracking-widest">
              Sphere<span className="text-brand-400">·</span>Members
            </p>
            <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <Crown className="h-3 w-3" aria-hidden /> Gold
            </span>
          </div>

          {/* Chip */}
          <div aria-hidden className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 opacity-80" />

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                Titular
              </p>
              <p className="truncate font-heading text-xl uppercase tracking-wide">{name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                Membro desde
              </p>
              <p className="font-heading text-xl tracking-wide">2026</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PromoBanner() {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      >
        <source src={BG} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30"
        aria-hidden
      />

      <div className="container relative grid items-center gap-14 py-24 md:py-32 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-brand-400">
              <span className="h-px w-8 bg-brand-400" aria-hidden />
              Sphere Members
            </p>
          </Reveal>

          <h2 className="font-heading text-5xl uppercase leading-[0.95] sm:text-7xl">
            <SplitReveal text="Quem é membro" stagger={0.06} />
            <br />
            <span className="text-brand-400">
              <SplitReveal text="joga em outro nível" stagger={0.06} delay={0.25} />
            </span>
          </h2>

          <Reveal delay={0.2}>
            <p className="mt-5 max-w-md text-white/70">
              Grátis para sempre. Crie sua conta e destrave benefícios que nenhum visitante vê.
            </p>
          </Reveal>

          <Reveal stagger={0.1} className="mt-9 grid gap-4 sm:grid-cols-2">
            {perks.map(({ icon: Icon, title, text }) => (
              <RevealItem
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition-colors duration-300 hover:border-brand-400/40 hover:bg-white/[0.09]"
              >
                <Icon
                  className="mb-2.5 h-5 w-5 text-brand-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                  aria-hidden
                />
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-white/55">{text}</p>
              </RevealItem>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-9 flex flex-wrap items-center gap-5">
            <Magnetic>
              <Link
                href={isAuthenticated ? '/products' : '/register'}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-transform active:scale-[0.98]"
              >
                {isAuthenticated ? 'Aproveitar benefícios' : 'Virar membro grátis'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <p className="flex items-center gap-1.5 text-xs text-white/60">
              <BadgeCheck className="h-4 w-4 text-emerald-400" aria-hidden />
              Sem mensalidade. Sem pegadinha.
            </p>
          </Reveal>
        </div>

        <Reveal direction="left" delay={0.2}>
          <MemberCard name={user?.name ?? 'Seu nome aqui'} />
        </Reveal>
      </div>
    </section>
  );
}
