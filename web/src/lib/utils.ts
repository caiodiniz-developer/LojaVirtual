import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

/** Price after the product's own discount, in cents. */
export function finalPrice(product: Pick<Product, 'price' | 'discount'>): number {
  return Math.round(product.price * (1 - product.discount / 100));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(date)
  );
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/** Estimated delivery date derived from the shipping method chosen at checkout. */
export function estimateDeliveryDate(createdAt: string, shippingMethod: string): Date {
  const days = shippingMethod.includes('Prioritário')
    ? 2
    : shippingMethod.includes('Expresso')
      ? 5
      : 11;
  const date = new Date(createdAt);
  date.setDate(date.getDate() + days);
  return date;
}

export function formatZipCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
