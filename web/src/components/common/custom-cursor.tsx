import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Accent cursor: a dot glued to the pointer and a trailing ring that grows
 * over interactive elements. Desktop-only; disabled for reduced motion.
 * The native cursor stays visible — this is a layer, not a replacement.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.5 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    // Delegated: the ring grows over anything clickable
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      setActive(
        Boolean(target?.closest('a, button, [role="button"], input, select, textarea, label'))
      );
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[99] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-brand-500"
      />
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{ scale: active ? 2.4 : 1, opacity: active ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed left-0 top-0 z-[99] -ml-4 -mt-4 h-8 w-8 rounded-full border border-brand-500/60"
      />
    </>
  );
}
