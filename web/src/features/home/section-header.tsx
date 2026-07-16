import { ArrowRight } from 'lucide-react';
import Link from '@/components/common/link';
import { Reveal } from '@/components/common/reveal';
import { SplitReveal } from '@/components/common/split-reveal';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({ eyebrow, title, description, href, linkLabel }: SectionHeaderProps) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
        )}
        <SplitReveal
          text={title}
          as="h2"
          className="font-heading text-3xl uppercase leading-none tracking-tight sm:text-4xl"
        />
        {description && <p className="max-w-lg text-sm text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors hover:border-foreground"
        >
          {linkLabel ?? 'Ver tudo'}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </Reveal>
  );
}
