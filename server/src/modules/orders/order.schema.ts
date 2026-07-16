import { z } from 'zod';

export const shippingQuoteSchema = z.object({
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  subtotal: z.number().int().min(0),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, 'O carrinho está vazio'),
  addressId: z.string().min(1),
  shippingMethod: z.enum(['standard', 'express', 'priority']),
  couponCode: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .optional(),
  payment: z.object({
    method: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO']),
    cardNumber: z
      .string()
      .regex(/^\d{16}$/, 'Número do cartão inválido')
      .optional(),
    cardHolder: z.string().max(80).optional(),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
