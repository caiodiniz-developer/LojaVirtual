import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

/** Deterministic base per product, gently oscillating to feel alive. */
function baseViewers(seed: string): number {
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 8 + (hash % 28); // 8–35 viewers
}

export function SocialProof({ productId }: { productId: string }) {
  const [viewers, setViewers] = useState(() => baseViewers(productId));

  useEffect(() => {
    setViewers(baseViewers(productId));
    const interval = setInterval(() => {
      setViewers((current) => {
        const drift = Math.floor(Math.random() * 5) - 2; // -2..+2
        return Math.max(4, current + drift);
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [productId]);

  return (
    <p aria-live="off" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <Eye className="h-3.5 w-3.5 text-brand-500" aria-hidden />
      <span className="tabular-nums">{viewers}</span> pessoas estão vendo este produto agora
    </p>
  );
}
