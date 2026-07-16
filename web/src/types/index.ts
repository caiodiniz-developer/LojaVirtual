export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  loyaltyPoints: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  _count?: { products: number };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number; // cents
  discount: number; // percentage
  images: string[];
  categoryId: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  stock: number;
  rating: number;
  reviewCount: number;
  sold: number;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface RatingBucket {
  rating: number;
  count: number;
}

export type LevelKey = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface LoyaltyLevel {
  key: LevelKey;
  label: string;
  min: number;
  next: number | null;
}

export interface PointsEntry {
  id: string;
  amount: number;
  reason: 'ORDER' | 'REVIEW' | 'SIGNUP' | 'REDEEM';
  createdAt: string;
}

export interface LoyaltySummary {
  points: number;
  level: LoyaltyLevel;
  pointsToNext: number;
  progress: number;
  entries: PointsEntry[];
}

export interface Notification {
  id: string;
  type: 'ORDER' | 'POINTS' | 'STOCK' | 'SYSTEM';
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string | null;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  cardLast4: string | null;
  paidAt: string | null;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode: string | null;
  shippingMethod: string;
  shippingAddress: Omit<Address, 'id' | 'isDefault'>;
  items: OrderItem[];
  payment: Payment | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface ShippingOption {
  id: 'standard' | 'express' | 'priority';
  label: string;
  carrier: string;
  price: number;
  estimatedDays: { min: number; max: number };
}

export interface CouponValidation {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  discount: number; // cents
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  createdAt: string;
  product: Product;
}

export interface DashboardData {
  totals: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    lowStock: number;
  };
  revenueByMonth: { key: string; label: string; revenue: number; orders: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  topProducts: Pick<Product, 'id' | 'title' | 'slug' | 'images' | 'sold' | 'price' | 'discount'>[];
  recentOrders: (Order & { user: { name: string; email: string } })[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Admin view of a customer: profile + addresses + full order history. */
export interface CustomerDetail extends User {
  addresses: Address[];
  orders: Order[];
}
