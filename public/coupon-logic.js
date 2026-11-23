import { calculateCartTotalCents } from '../catalog-logic.js';

export const COUPON_CODE = 'FirstPurchase';
export const COUPON_DISCOUNT_PERCENT = 10;
export const COUPON_MINIMUM_SUBTOTAL_CENTS = 5000;

/** §REQ:CPN-DI-SCNT-QAD-020, §REQ:CPN-DI-SCNT-QAD-030 */
export function isCouponButtonVisible(subtotalCents) {
  return subtotalCents > COUPON_MINIMUM_SUBTOTAL_CENTS;
}

/** §REQ:CPN-DI-SCNT-QAD-040 */
export async function copyCouponCode(clipboard) {
  try {
    await clipboard.writeText(COUPON_CODE);
    return { copied: true, message: `Codice ${COUPON_CODE} copiato. Incollalo nella pagina di pagamento.` };
  } catch {
    return { copied: false, message: `Non è stato possibile copiare il codice. Inserisci ${COUPON_CODE} nella pagina di pagamento.` };
  }
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
