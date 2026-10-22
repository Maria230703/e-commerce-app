import { calculateCartTotalCents } from '../catalog-logic.js';

export const COUPON_CODE = 'ESEMPIO10';
export const COUPON_DISCOUNT_PERCENT = 10;
export const COUPON_MINIMUM_SUBTOTAL_CENTS = 5000;

export function validateCouponCode(code, subtotalCents) {
  if (typeof code !== 'string' || !code.trim()) {
    return 'Inserisci un coupon';
  }

  if (code.trim().toUpperCase() !== COUPON_CODE) {
    return 'Codice coupon non valido';
  }

  if (subtotalCents <= COUPON_MINIMUM_SUBTOTAL_CENTS) {
    return 'Il coupon è disponibile per acquisti superiori a 50,00 €';
  }

  return null;
}

export function calculateCouponDiscountCents(subtotalCents, code) {
  if (validateCouponCode(code, subtotalCents)) {
    return 0;
  }

  return Math.round(subtotalCents * COUPON_DISCOUNT_PERCENT / 100);
}

export function calculateDiscountedCartTotals(items, code = '') {
  const totals = calculateCartTotalCents(items);
  const discountCents = calculateCouponDiscountCents(totals.subtotalCents, code);

  return {
    ...totals,
    discountCents,
    totalCents: totals.totalCents - discountCents
  };
}
