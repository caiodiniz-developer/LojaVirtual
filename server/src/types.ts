// Enum-like unions kept in code since SQLite has no native enums.
// The API boundary validates these with Zod before they reach the database.

export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'REFUNDED';

export type DiscountType = 'PERCENTAGE' | 'FIXED';
