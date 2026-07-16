import { useMemo, type ElementType } from 'react';
import { motion } from 'framer-motion';

interface SplitRevealProps {
  text: string;
  /** 'words' rises word by word; 'chars' letter by letter. */
  by?: 'words' | 'chars';
  as?: ElementType;
  className?: string;
  /** Animate on mount instead of on scroll (for heroes above the fold). */
  onMount?: boolean;
  delay?: number;
  stagger?: number;
}

/**
 * Awwwards-style masked text reveal: each fragment rises out of an
 * overflow-hidden line, staggered one by one.
 */
export function SplitReveal({
  text,
  by = 'words',
  as = 'span',
  className,
  onMount = false,
  delay = 0,
  stagger = 0.045,
}: SplitRevealProps) {
  // Cast keeps intrinsic-element prop typing while allowing any tag at runtime
  const Tag = as as 'span';
  const fragments = useMemo(
    () => (by === 'words' ? text.split(' ') : [...text]),
    [text, by]
  );

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const fragment = {
    hidden: { y: '110%', rotate: 4 },
    visible: {
      y: '0%',
      rotate: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden
        variants={container}
        initial="hidden"
        {...(onMount
          ? { animate: 'visible' }
          : { whileInView: 'visible', viewport: { once: true, margin: '-80px' } })}
        className="inline"
      >
        {fragments.map((piece, index) => (
          <span key={index} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span variants={fragment} className="inline-block will-change-transform">
              {piece === ' ' ? ' ' : piece}
            </motion.span>
            {by === 'words' && index < fragments.length - 1 ? ' ' : ''}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
