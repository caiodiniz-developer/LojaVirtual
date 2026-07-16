import { z } from 'zod';

export const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
  search: z.string().trim().max(120).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(), // cents
  maxPrice: z.coerce.number().int().min(0).optional(), // cents
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  onSale: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'rating', 'bestselling', 'discount'])
    .default('newest'),
});

export type ListProductsQuery = z.infer<typeof listProductsSchema>;

export const upsertProductSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10),
  price: z.number().int().min(1), // cents
  discount: z.number().int().min(0).max(90).default(0),
  images: z.array(z.string().url()).min(1, 'Adicione pelo menos uma imagem'),
  categoryId: z.string().min(1),
  stock: z.number().int().min(0),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
