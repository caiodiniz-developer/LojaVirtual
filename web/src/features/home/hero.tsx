import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from '@/components/common/link';
import { gsap } from '@/lib/gsap';
import { SplitReveal } from '@/components/common/split-reveal';
import { Magnetic } from '@/components/common/magnetic';

const POSTER = '/logo-inteira.png';
const VIDEO_SRC = '/bg-hero.mp4';

export function Hero() {
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Cinematic scroll parallax: media zooms slightly while the copy drifts away
  useGSAP(
    () => {
      const scrollTrigger = {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      };
      gsap.to('[data-hero-media]', { yPercent: 14, scale: 1.12, ease: 'none', scrollTrigger });
      gsap.to('[data-hero-content]', { yPercent: -22, opacity: 0.15, ease: 'none', scrollTrigger });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[92vh] min-h-[560px] items-end overflow-hidden bg-zinc-950 text-white"
    >
      <div data-hero-media className="absolute inset-0 will-change-transform">
        {/* Animated poster — always present, covered by the video once it can play */}
        <img
          src={POSTER}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
        />

        {!videoFailed && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={POSTER}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              videoReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Legibility gradients */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" aria-hidden />

      <div data-hero-content className="container relative pb-20 will-change-transform md:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-white/80"
        >
          Nova coleção Sphere Running
        </motion.p>

        <h1 className="max-w-4xl font-heading text-6xl uppercase leading-[0.92] tracking-tight sm:text-8xl md:text-9xl">
          <SplitReveal text="Supere seus" by="chars" onMount delay={0.15} stagger={0.035} />
          <br />
          <span className="text-brand-400">
            <SplitReveal text="limites" by="chars" onMount delay={0.55} stagger={0.05} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-5 max-w-md text-base text-white/80 sm:text-lg"
        >
          Placa de carbono, espuma de retorno de energia e o design mais desejado da temporada.
          Feito para quem corre atrás.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Magnetic>
            <Link
              href="/products?category=tenis"
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-transform active:scale-[0.98]"
            >
              Comprar agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>

          <Magnetic strength={0.25}>
            <Link
              href="/products?sort=newest"
              className="flex items-center rounded-full border-2 border-white/40 px-8 py-3.5 text-sm font-bold uppercase tracking-wide backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10"
            >
              Ver lançamentos
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 1.2, y: { repeat: Infinity, duration: 1.8 } }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
        aria-hidden
      >
        <ChevronDown className="h-6 w-6 text-white/50" />
      </motion.div>
    </section>
  );
}
