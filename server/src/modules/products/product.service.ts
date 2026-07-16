import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/api-error';
import { paginate } from '../../utils/pagination';
import { slugify } from '../../utils/slugify';
import type { ListProductsQuery, upsertProductSchema } from './product.schema';

type UpsertProductInput = z.infer<typeof upsertProductSchema>;

const SORT_MAP: Record<ListProductsQuery['sort'], Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  rating: { rating: 'desc' },
  bestselling: { sold: 'desc' },
  discount: { discount: 'desc' },
};

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude;

export const productService = {
  async list(query: ListProductsQuery, includeInactive = false) {
    const where: Prisma.ProductWhereInput = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.inStock ? { stock: { gt: 0 } } : {}),
      ...(query.featured ? { isFeatured: true } : {}),
      ...(query.onSale ? { discount: { gt: 0 } } : {}),
      ...(query.minRating ? { rating: { gte: query.minRating } } : {}),
      ...(query.minPrice != null || query.maxPrice != null
        ? { price: { gte: query.minPrice, lte: query.maxPrice } }
        : {}),
      ...(query.search
        ? {
            // SQLite LIKE is case-insensitive for ASCII by default
            OR: [
              { title: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: SORT_MAP[query.sort],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return paginate(data, total, query);
  },

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (!product || !product.isActive) throw ApiError.notFound('Produto não encontrado');
    return product;
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
    if (!product) throw ApiError.notFound('Produto não encontrado');
    return product;
  },

  async related(slug: string, limit = 4) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) throw ApiError.notFound('Produto não encontrado');

    return prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      include: productInclude,
      orderBy: { sold: 'desc' },
      take: limit,
    });
  },

  async create(input: UpsertProductInput) {
    const slug = await uniqueSlug(input.title);
    return prisma.product.create({ data: { ...input, slug }, include: productInclude });
  },

  async update(id: string, input: Partial<UpsertProductInput>) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Produto não encontrado');

    const slug =
      input.title && input.title !== existing.title ? await uniqueSlug(input.title) : undefined;

    const updated = await prisma.product.update({
      where: { id },
      data: { ...input, ...(slug ? { slug } : {}) },
      include: productInclude,
    });

    // Back-in-stock: fire pending alerts when stock crosses from 0 to positive
    if (existing.stock === 0 && updated.stock > 0) {
      await this.fireStockAlerts(updated.id, updated.title, updated.slug);
    }

    return updated;
  },

  /** Notifies everyone waiting for this product. Portfolio project: logs instead of e-mailing. */
  async fireStockAlerts(productId: string, title: string, slug: string) {
    const alerts = await prisma.stockAlert.findMany({
      where: { productId, notifiedAt: null },
    });
    if (alerts.length === 0) return;

    for (const alert of alerts) {
      console.log(`📩 Back-in-stock: "${title}" → ${alert.email} (/products/${slug})`);
      // If the subscriber is a registered user, drop an in-app notification too
      const user = await prisma.user.findUnique({ where: { email: alert.email } });
      if (user) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'STOCK',
            title: 'Voltou ao estoque! 🎉',
            body: `"${title}" está disponível novamente. Corre antes que acabe.`,
            link: `/products/${slug}`,
          },
        });
      }
    }

    await prisma.stockAlert.updateMany({
      where: { productId, notifiedAt: null },
      data: { notifiedAt: new Date() },
    });
  },

  async remove(id: string) {
    await prisma.product.delete({ where: { id } });
  },

  /**
   * Simulated price history: a deterministic walk seeded by the product id,
   * always converging to the current price. Stable across calls so the chart
   * doesn't change on every refresh.
   */
  async priceHistory(id: string, days: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Produto não encontrado');

    const current = Math.round(product.price * (1 - product.discount / 100));
    const seed = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const points: { date: string; price: number }[] = [];
    for (let i = days; i >= 0; i--) {
      const wave =
        Math.sin((seed + i) * 0.35) * 0.06 +
        Math.sin((seed + i) * 0.08) * 0.1 +
        (product.discount > 0 ? 0.08 : 0.02); // pre-discount era costs a bit more
      const decay = i / days; // influence of history fades toward today
      const price = Math.round(current * (1 + Math.max(0, wave) * decay));
      const date = new Date();
      date.setDate(date.getDate() - i);
      points.push({ date: date.toISOString().slice(0, 10), price });
    }
    points[points.length - 1].price = current;

    const last90 = points.slice(-91);
    const lowest90 = Math.min(...last90.map((p) => p.price));

    return { data: points, current, lowest90, isLowest: current <= lowest90 };
  },
};

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${++i}`;
  }
  return candidate;
}
