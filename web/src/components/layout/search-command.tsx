import { useEffect, useState } from 'react';
import Image from '@/components/common/image';
import { useRouter } from '@/lib/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, PackageSearch, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useDebounce } from '@/hooks/use-debounce';
import { useUiStore } from '@/stores/ui-store';
import { finalPrice, formatPrice } from '@/lib/utils';

export function SearchCommand() {
  const { searchOpen, setSearchOpen } = useUiStore();
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term, 350);
  const router = useRouter();

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!useUiStore.getState().searchOpen);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  useEffect(() => {
    if (!searchOpen) setTerm('');
  }, [searchOpen]);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => productService.list({ search: debounced, limit: 6 }),
    enabled: searchOpen && debounced.length >= 2,
  });

  function goTo(path: string) {
    setSearchOpen(false);
    router.push(path);
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Busca de produtos"
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              {isFetching ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
              )}
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && term.trim()) {
                    goTo(`/products?search=${encodeURIComponent(term.trim())}`);
                  }
                }}
                placeholder="Busque por produtos, marcas, categorias…"
                aria-label="Buscar produtos"
                className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {debounced.length < 2 && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Digite pelo menos 2 caracteres para buscar
                </p>
              )}

              {debounced.length >= 2 && data && data.data.length === 0 && !isFetching && (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <PackageSearch className="h-8 w-8 text-muted-foreground" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado para “{debounced}”
                  </p>
                </div>
              )}

              {data?.data.map((product) => (
                <button
                  key={product.id}
                  onClick={() => goTo(`/products/${product.slug}`)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{product.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.category?.name}
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{formatPrice(finalPrice(product))}</span>
                </button>
              ))}

              {data && data.data.length > 0 && (
                <button
                  onClick={() => goTo(`/products?search=${encodeURIComponent(debounced)}`)}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm font-medium text-brand-600 transition-colors hover:bg-muted dark:text-brand-400"
                >
                  Ver todos os resultados <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
