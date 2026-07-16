import { lazy, Suspense, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { Gauge, Feather, Recycle, Zap } from 'lucide-react';
import { gsap } from '@/lib/gsap';

// three.js only downloads when the section approaches the viewport
const SphereCanvas = lazy(() => import('@/features/three/sphere-canvas'));

const features = [
  { icon: Zap, title: 'NitroFoam™', text: '85% de retorno de energia a cada passada.' },
  { icon: Feather, title: 'AeroKnit', text: 'Cabedal de 98g que veste como uma segunda pele.' },
  { icon: Gauge, title: 'CarbonDrive', text: 'Placa de carbono full-length para propulsão máxima.' },
  { icon: Recycle, title: 'ReSphere', text: '72% de materiais reciclados em cada par.' },
];

const stats = [
  { value: 120, suffix: 'k+', decimals: 0, label: 'Atletas equipados' },
  { value: 4.9, suffix: '★', decimals: 1, label: 'Avaliação média' },
  { value: 98, suffix: '%', decimals: 0, label: 'Entregas no prazo' },
  { value: 30, suffix: ' dias', decimals: 0, label: 'Troca grátis' },
];

export function TechShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasVisible = useInView(sectionRef, { once: true, margin: '400px' });

  useGSAP(
    () => {
      // Copy blocks slide in as the section enters
      gsap.from('[data-reveal]', {
        y: 44,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
      });

      // Count-up stats
      gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
        const target = Number(el.dataset.counter);
        const decimals = Number(el.dataset.decimals ?? 0);
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => {
            el.textContent = counter.value.toFixed(decimals);
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="tech-heading"
      className="overflow-hidden bg-zinc-950 py-24 text-white md:py-32"
    >
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p data-reveal className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-brand-400">
              Sphere Lab
            </p>
            <h2
              id="tech-heading"
              data-reveal
              className="font-heading text-5xl uppercase leading-[0.95] sm:text-6xl"
            >
              Engenharia
              <br />
              em <span className="text-brand-400">movimento</span>
            </h2>
            <p data-reveal className="mt-5 max-w-md text-white/70">
              Cada produto Sphere nasce no nosso laboratório de performance — testado por atletas,
              aprovado pela ciência.
            </p>

            <ul className="mt-9 grid gap-5 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} data-reveal className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Icon className="mb-2.5 h-5 w-5 text-brand-400" aria-hidden />
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal className="relative h-[380px] md:h-[480px]" aria-hidden>
            {canvasVisible && (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <div className="h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-brand-500/40 to-fuchsia-500/30 blur-2xl" />
                  </div>
                }
              >
                <SphereCanvas />
              </Suspense>
            )}
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-12 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <dd className="font-heading text-4xl text-white sm:text-5xl">
                <span data-counter={stat.value} data-decimals={stat.decimals}>
                  0
                </span>
                <span className="text-brand-400">{stat.suffix}</span>
              </dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-white/50">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
