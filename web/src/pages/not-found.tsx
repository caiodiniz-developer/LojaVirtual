import Link from '@/components/common/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <p className="font-display text-8xl font-bold gradient-text">404</p>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold">Página não encontrada</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi movido. Que tal explorar nossos
          produtos?
        </p>
      </div>
      <Link
        href="/products"
        className="flex h-11 items-center gap-2 rounded-xl gradient-brand px-6 text-sm font-medium text-white shadow-soft transition-all hover:shadow-glow"
      >
        <Compass className="h-4 w-4" /> Explorar produtos
      </Link>
    </div>
  );
}
