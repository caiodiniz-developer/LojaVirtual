import { usePageMeta } from '@/hooks/use-page-meta';
import { Hero } from '@/features/home/hero';
import { Marquee } from '@/features/home/marquee';
import { BigType } from '@/features/home/big-type';
import { CategoriesSection } from '@/features/home/categories-section';
import { TechShowcase } from '@/features/home/tech-showcase';
import { ProductRail } from '@/features/home/product-rail';
import { PromoBanner } from '@/features/home/promo-banner';
import { Testimonials } from '@/features/home/testimonials';
import { Newsletter } from '@/features/home/newsletter';

export default function HomePage() {
  usePageMeta();

  return (
    <>
      <Hero />
      <Marquee />
      <ProductRail
        eyebrow="Acabou de chegar"
        title="Lançamentos"
        description="Os drops mais recentes da temporada — antes que esgotem."
        href="/products?sort=newest"
        filters={{ sort: 'newest', limit: 4 }}
      />
      <CategoriesSection />
      <TechShowcase />
      <ProductRail
        eyebrow="Seleção Sphere"
        title="Destaques da semana"
        description="A curadoria do nosso time com o melhor da loja."
        href="/products?featured=true"
        filters={{ featured: true, limit: 8 }}
      />
      <BigType />
      <PromoBanner />
      <ProductRail
        eyebrow="Por tempo limitado"
        title="Ofertas imperdíveis"
        description="Descontos reais nos produtos mais desejados."
        href="/products?onSale=true"
        filters={{ onSale: true, sort: 'discount', limit: 4 }}
      />
      <ProductRail
        eyebrow="Os queridinhos"
        title="Mais vendidos"
        href="/products?sort=bestselling"
        filters={{ sort: 'bestselling', limit: 4 }}
      />
      <Testimonials />
      <Newsletter />
    </>
  );
}
