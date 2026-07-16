import crypto from 'node:crypto';
import type { Prisma } from '@prisma/client';
import type { OrderStatus } from '../../types';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/api-error';
import { computeCouponDiscount, findValidCoupon } from '../coupons/coupon.service';
import { findShippingOption } from './shipping.service';
import { awardPoints, POINTS } from '../loyalty/loyalty.service';
import { notify } from '../notifications/notification.service';
import type { CheckoutInput } from './order.schema';

const orderInclude = {
  items: true,
  payment: true,
} satisfies Prisma.OrderInclude;

function generateOrderCode(): string {
  return `SS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * Simulated payment gateway. Deterministic so it can be demoed:
 * a card number ending in 0000 is declined; everything else is approved.
 */
function processFakePayment(input: CheckoutInput['payment']): {
  approved: boolean;
  transactionId: string;
} {
  const approved = !(input.method === 'CREDIT_CARD' && input.cardNumber?.endsWith('0000'));
  return { approved, transactionId: `txn_${crypto.randomBytes(10).toString('hex')}` };
}

export const orderService = {
  async checkout(userId: string, input: CheckoutInput) {
    const address = await prisma.address.findFirst({
      where: { id: input.addressId, userId },
    });
    if (!address) throw ApiError.notFound('Endereço não encontrado');

    const products = await prisma.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) } },
    });

    // Validate items and compute the subtotal server-side — client totals are never trusted
    const lineItems = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.isActive) {
        throw ApiError.badRequest('Um dos produtos não está mais disponível');
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Estoque insuficiente para "${product.title}"`);
      }
      const unitPrice = Math.round(product.price * (1 - product.discount / 100));
      return { product, quantity: item.quantity, unitPrice };
    });

    const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);

    const coupon = input.couponCode ? await findValidCoupon(input.couponCode, subtotal) : null;
    const discount = coupon ? computeCouponDiscount(coupon, subtotal) : 0;

    const shipping = findShippingOption(input.shippingMethod, address.zipCode, subtotal);
    if (!shipping) throw ApiError.badRequest('Método de frete inválido');

    const total = subtotal - discount + shipping.price;

    if (input.payment.method === 'CREDIT_CARD' && !input.payment.cardNumber) {
      throw ApiError.badRequest('Informe os dados do cartão');
    }

    const payment = processFakePayment(input.payment);
    if (!payment.approved) {
      throw new ApiError(402, 'Pagamento recusado pela operadora. Tente outro cartão.');
    }

    return prisma.$transaction(async (tx) => {
      // Atomic stock decrement guards against race conditions between checkouts
      for (const li of lineItems) {
        const updated = await tx.product.updateMany({
          where: { id: li.product.id, stock: { gte: li.quantity } },
          data: { stock: { decrement: li.quantity }, sold: { increment: li.quantity } },
        });
        if (updated.count === 0) {
          throw ApiError.badRequest(`Estoque insuficiente para "${li.product.title}"`);
        }
      }

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const order = await tx.order.create({
        data: {
          code: generateOrderCode(),
          userId,
          status: 'PAID',
          subtotal,
          discount,
          shippingCost: shipping.price,
          total,
          couponCode: coupon?.code ?? null,
          shippingMethod: `${shipping.label} · ${shipping.carrier}`,
          shippingAddress: {
            label: address.label,
            street: address.street,
            number: address.number,
            complement: address.complement,
            district: address.district,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
          },
          items: {
            create: lineItems.map((li) => ({
              productId: li.product.id,
              title: li.product.title,
              image: (li.product.images as string[])[0] ?? '',
              price: li.unitPrice,
              quantity: li.quantity,
            })),
          },
          payment: {
            create: {
              method: input.payment.method,
              status: 'APPROVED',
              amount: total,
              cardLast4: input.payment.cardNumber?.slice(-4) ?? null,
              transactionId: payment.transactionId,
              paidAt: new Date(),
            },
          },
        },
        include: orderInclude,
      });

      // The purchased items leave the server-side cart
      await tx.cartItem.deleteMany({
        where: { userId, productId: { in: lineItems.map((li) => li.product.id) } },
      });

      // Loyalty: earn 1 point per R$1, notify the customer
      const earned = POINTS.perOrderTotal(total);
      await awardPoints(tx, userId, earned, 'ORDER');
      await notify(tx, {
        userId,
        type: 'ORDER',
        title: `Pedido ${order.code} confirmado 🎉`,
        body: `Pagamento aprovado. Você ganhou ${earned} pontos Sphere!`,
        link: `/account/orders/${order.id}`,
      });

      return order;
    });
  },

  /** Rebuilds the cart from a past order, skipping items that are gone/out of stock. */
  async reorder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw ApiError.notFound('Pedido não encontrado');

    const productIds = order.items.map((i) => i.productId).filter((id): id is string => Boolean(id));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, stock: { gt: 0 } },
    });

    let added = 0;
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      const quantity = Math.min(item.quantity, product.stock);
      await prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId: product.id } },
        create: { userId, productId: product.id, quantity },
        update: { quantity },
      });
      added += 1;
    }

    return { added, total: order.items.length };
  },

  async listMine(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getMine(userId: string, id: string) {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: orderInclude,
    });
    if (!order) throw ApiError.notFound('Pedido não encontrado');
    return order;
  },

  async listAll(params: { page: number; limit: number; status?: OrderStatus }) {
    const where: Prisma.OrderWhereInput = params.status ? { status: params.status } : {};
    const [data, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: { ...orderInclude, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return {
      data,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.limit)),
        hasNextPage: params.page * params.limit < total,
      },
    };
  },

  async updateStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw ApiError.notFound('Pedido não encontrado');

    return prisma.$transaction(async (tx) => {
      // Stock bookkeeping when an order crosses the CANCELLED boundary
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        await restockItems(tx, order.items);
        await tx.payment.updateMany({
          where: { orderId: id, status: 'APPROVED' },
          data: { status: 'REFUNDED' },
        });
      } else if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
        await consumeStock(tx, order.items);
        await tx.payment.updateMany({
          where: { orderId: id, status: 'REFUNDED' },
          data: { status: 'APPROVED' },
        });
      }

      return tx.order.update({ where: { id }, data: { status }, include: orderInclude });
    });
  },

  /** Customer-initiated cancellation: allowed before the order ships. */
  async cancelMine(userId: string, id: string) {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!order) throw ApiError.notFound('Pedido não encontrado');

    const cancellable: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING'];
    if (!cancellable.includes(order.status as OrderStatus)) {
      throw ApiError.badRequest(
        order.status === 'CANCELLED'
          ? 'Este pedido já foi cancelado'
          : 'Este pedido já foi enviado e não pode mais ser cancelado'
      );
    }

    return prisma.$transaction(async (tx) => {
      await restockItems(tx, order.items);
      await tx.payment.updateMany({
        where: { orderId: id, status: 'APPROVED' },
        data: { status: 'REFUNDED' },
      });
      // Roll back the loyalty points earned on this order
      await awardPoints(tx, userId, -POINTS.perOrderTotal(order.total), 'ORDER');
      await notify(tx, {
        userId,
        type: 'ORDER',
        title: `Pedido ${order.code} cancelado`,
        body: 'Os itens voltaram ao estoque e o pagamento foi estornado.',
        link: `/account/orders/${id}`,
      });
      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: orderInclude,
      });
    });
  },
};

type TxClient = Prisma.TransactionClient;
type StockItem = { productId: string | null; quantity: number };

/** Returns cancelled items to the shelf and rolls back the sold counter. */
async function restockItems(tx: TxClient, items: StockItem[]) {
  for (const item of items) {
    if (!item.productId) continue;
    await tx.product.updateMany({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity }, sold: { decrement: item.quantity } },
    });
  }
}

/** Re-consumes stock when an order is reactivated; fails if stock ran out meanwhile. */
async function consumeStock(tx: TxClient, items: StockItem[]) {
  for (const item of items) {
    if (!item.productId) continue;
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } },
    });
    if (updated.count === 0) {
      throw ApiError.badRequest('Estoque insuficiente para reativar este pedido');
    }
  }
}
