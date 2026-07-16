import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

const words = ['Just Move', 'ShopSphere', 'Sem Limites', 'Desde 2026'];

/** Awwwards-style giant typography strip driven by scroll position. */
export function BigType() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.to('[data-big-track]', {
        xPercent: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} aria-hidden className="overflow-hidden py-14 md:py-20">
      <div data-big-track className="flex w-max items-center gap-12 will-change-transform">
        {[...words, ...words].map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="whitespace-nowrap font-heading text-[13vw] uppercase leading-none md:text-[9vw]"
            style={
              index % 2 === 0
                ? undefined
                : { WebkitTextStroke: '2px hsl(var(--foreground) / 0.3)', color: 'transparent' }
            }
          >
            {word}
            <span className="mx-6 text-brand-500" style={{ WebkitTextStroke: '0px' }}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
