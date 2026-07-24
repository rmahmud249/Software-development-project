export function formatPrice(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

export function discountPct(price: number, salePrice: number | null): number {
  if (salePrice == null || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function classNames(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(' ');
}

export function timeLeft(endIso: string | null): { h: number; m: number; s: number; total: number } {
  if (!endIso) return { h: 0, m: 0, s: 0, total: 0 };
  const total = Math.max(0, Math.floor((new Date(endIso).getTime() - Date.now()) / 1000));
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60, total };
}

export function formatDate(d: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d));
}
