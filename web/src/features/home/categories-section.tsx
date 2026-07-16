import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from '@/components/common/image';
import Link from '@/components/common/link';
import { useCategories } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from './section-header';
import { cn } from '@/lib/utils';

/** Editorial category grid: the first two categories get hero-sized tiles. */
export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();

  if (!isLoading && (!categories || categories.length === 0)) return null;

  return (
    <section className="container py-16">
      <SectionHeader eyebrow="Encontre o seu jogo" title="Compre por esporte" href="/products" />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="col-span-2 aspect-[16/10] rounded-3xl" />
          <Skeleton className="col-span-2 aspect-[16/10] rounded-3xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories!.map((category, index) => {
            const isLarge = index < 2;
            return (
              <motion.div
                key={category.id}
                initial={{ clipPath: 'inset(100% 0% 0% 0% round 24px)' }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: (index % 4) * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className={cn(isLarge && 'col-span-2')}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className={cn(
                    'group relative block overflow-hidden rounded-3xl bg-zinc-900',
                    isLarge ? 'aspect-[16/10]' : 'aspect-[4/5]'
                  )}
                >
                  {category.image && (
                    <motion.div
                      initial={{ scale: 1.25 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 1.1, delay: (index % 4) * 0.09, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={category.image}
                        alt=""
                        fill
                        className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      />
                    </motion.div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-5 md:p-7">
                    <div>
                      <p
                        className={cn(
                          'font-heading uppercase leading-none text-white',
                          isLarge ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'
                        )}
                      >
                        {category.name}
                      </p>
                      {category._count && (
                        <p className="mt-1.5 text-xs font-medium text-white/70">
                          {category._count.products} produtos
                        </p>
                      )}
                    </div>
                    <span className="flex h-10 w-10 shrink-0 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
