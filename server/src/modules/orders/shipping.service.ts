export interface ShippingOption {
  id: 'standard' | 'express' | 'priority';
  label: string;
  carrier: string;
  price: number; // cents
  estimatedDays: { min: number; max: number };
}

const FREE_SHIPPING_THRESHOLD = 25_000; // R$ 250,00

/**
 * Simulated shipping quote. Deterministic: varies slightly by ZIP region
 * (first digit) so the demo feels realistic without a real carrier API.
 */
export function quoteShipping(zipCode: string, subtotal: number): ShippingOption[] {
  const region = Number(zipCode.replace(/\D/g, '').charAt(0) || '0');
  const regionFactor = region * 120; // farther regions cost a bit more

  const standardPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 1_990 + regionFactor;

  return [
    {
      id: 'standard',
      label: 'Econômico',
      carrier: 'SphereLog',
      price: standardPrice,
      estimatedDays: { min: 6, max: 11 },
    },
    {
      id: 'express',
      label: 'Expresso',
      carrier: 'SphereLog Express',
      price: 3_490 + regionFactor,
      estimatedDays: { min: 2, max: 5 },
    },
    {
      id: 'priority',
      label: 'Prioritário',
      carrier: 'SphereJet',
      price: 5_990 + regionFactor,
      estimatedDays: { min: 1, max: 2 },
    },
  ];
}

export function findShippingOption(id: string, zipCode: string, subtotal: number): ShippingOption | undefined {
  return quoteShipping(zipCode, subtotal).find((o) => o.id === id);
}
