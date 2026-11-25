import { calculateCartTotalCents } from '../catalog-logic.js';

export const COUPON_CODE = 'FirstPurchase';
export const COUPON_DISCOUNT_PERCENT = 10;
export const COUPON_MINIMUM_SUBTOTAL_CENTS = 5000;

/** §REQ:CPN-DI-SCNT-QAD-020, §REQ:CPN-DI-SCNT-QAD-030 */
export function isCouponButtonVisible(subtotalCents) {
  return subtotalCents > COUPON_MINIMUM_SUBTOTAL_CENTS;
}

/**
 * §REQ:CPN-DI-SCNT-QAD-040, §REQ:CPNC-2PMRGV, §REQ:CPNC-4MYF8T
 * Copia il codice negli appunti; se non sono disponibili o rifiutano, prova il metodo alternativo.
 */
export async function copyCouponCode(clipboard, fallbackCopy) {
  if (typeof clipboard?.writeText === 'function') {
    try {
      await clipboard.writeText(COUPON_CODE);
      return { copied: true, message: 'Copiato', announcement: 'Codice copiato' };
    } catch {
      // si prova il metodo alternativo
    }
  }

  try {
    if (typeof fallbackCopy === 'function' && fallbackCopy(COUPON_CODE)) {
      return { copied: true, message: 'Copiato', announcement: 'Codice copiato' };
    }
  } catch {
    // copia non riuscita
  }

  return { copied: false, message: 'Copia non riuscita', announcement: 'Copia non riuscita' };
}

/** §REQ:CPN-DI-SCNT-QAD-010, §REQ:CPN-DI-SCNT-QAD-060, §REQ:CPN-DI-SCNT-QAD-070 */
export function validateCouponCode(code, subtotalCents) {
  if (typeof code !== 'string' || !code.trim()) {
    return 'Inserisci un coupon';
  }

  if (code.trim().toUpperCase() !== COUPON_CODE.toUpperCase()) {
    return 'Codice coupon non valido';
  }

  if (subtotalCents <= COUPON_MINIMUM_SUBTOTAL_CENTS) {
    return 'Il coupon è disponibile per acquisti superiori a 50,00 €';
  }

  return null;
}

/** §REQ:CPN-DI-SCNT-QAD-050 */
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
