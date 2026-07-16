import { ArrowRight } from 'lucide-react';
import Link from '@/components/common/link';

export function AnnouncementBar() {
  return (
    <div className="bg-foreground text-background">
      <Link
        href="/register"
        className="container flex h-9 items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
      >
        <span className="hidden sm:inline">Membros ganham frete grátis +</span>
        10% off na primeira compra com o cupom BEMVINDO10
        <ArrowRight className="h-3 w-3" aria-hidden />
      </Link>
    </div>
  );
}
