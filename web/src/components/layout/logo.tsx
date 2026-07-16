import Link from '@/components/common/link';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-2', className)} aria-label="ShopSphere — Início">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-glow transition-transform duration-300 group-hover:rotate-6">
        <Sparkles className="h-5 w-5 text-white" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Shop<span className="gradient-text">Sphere</span>
      </span>
    </Link>
  );
}
