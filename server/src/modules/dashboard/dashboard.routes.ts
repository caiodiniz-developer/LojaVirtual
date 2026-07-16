import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAdmin } from '../../middlewares/auth.middleware';

export const dashboardRoutes = Router();

const REVENUE_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

dashboardRoutes.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [revenueAgg, ordersCount, customersCount, productsCount, recentOrders, topProducts, statusGroups, monthlyOrders, lowStock] =
      await prisma.$transaction([
        prisma.order.aggregate({
          where: { status: { in: [...REVENUE_STATUSES] } },
          _sum: { total: true },
        }),
        prisma.order.count(),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.product.count(),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { user: { select: { name: true, email: true } } },
        }),
        prisma.product.findMany({
          orderBy: { sold: 'desc' },
          take: 5,
          select: { id: true, title: true, slug: true, images: true, sold: true, price: true, discount: true },
        }),
        prisma.order.groupBy({ by: ['status'], _count: true, orderBy: { status: 'asc' } }),
        prisma.order.findMany({
          where: { createdAt: { gte: sixMonthsAgo }, status: { in: [...REVENUE_STATUSES] } },
          select: { createdAt: true, total: true },
        }),
        prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
      ]);

    // Aggregate revenue per month in JS — trivial at portfolio scale
    const months: { key: string; label: string; revenue: number; orders: number }[] = [];
    const cursor = new Date(sixMonthsAgo);
    for (let i = 0; i < 6; i++) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: cursor.toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: 0,
        orders: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const order of monthlyOrders) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) {
        bucket.revenue += order.total;
        bucket.orders += 1;
      }
    }

    res.json({
      totals: {
        revenue: revenueAgg._sum.total ?? 0,
        orders: ordersCount,
        customers: customersCount,
        products: productsCount,
        lowStock,
      },
      revenueByMonth: months,
      ordersByStatus: statusGroups.map((g) => ({ status: g.status, count: g._count })),
      topProducts,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});
