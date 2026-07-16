import { motion } from 'framer-motion';
import { RatingStars } from '@/components/ui/rating-stars';
import { getInitials } from '@/lib/utils';
import { SectionHeader } from './section-header';

const testimonials = [
  {
    name: 'Mariana Costa',
    role: 'Cliente desde 2024',
    rating: 5,
    text: 'A experiência de compra é impecável. O site é rápido, bonito e a entrega chegou dois dias antes do prazo. Virei cliente fiel!',
  },
  {
    name: 'Rafael Oliveira',
    role: 'Cliente desde 2025',
    rating: 5,
    text: 'Comprei um fone com desconto e a qualidade superou o preço. O rastreamento do pedido em tempo real é um diferencial enorme.',
  },
  {
    name: 'Juliana Santos',
    role: 'Cliente desde 2024',
    rating: 4,
    text: 'Atendimento excelente e curadoria de produtos muito boa. Sempre encontro coisas que não vejo em outras lojas.',
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="container">
        <SectionHeader
          eyebrow="Depoimentos"
          title="Quem compra, recomenda"
          description="Mais de 10 mil clientes satisfeitos em todo o Brasil."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <RatingStars rating={testimonial.rating} size="sm" />
              <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                “{testimonial.text}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                  {getInitials(testimonial.name)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
