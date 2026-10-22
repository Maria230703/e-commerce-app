import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateCartTotalCents, PRODUCTS } from './catalog-logic.js';
import { getFrameSelectionPriceCents, describeFrameSelection } from './public/frame-logic.js';
import { PAYMENT_METHODS, validateShippingAddress } from './public/payment-logic.js';
import { calculateDiscountedCartTotals, validateCouponCode } from './public/coupon-logic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ORDERS_FILE = path.join(__dirname, 'orders.json');

let orderQueue = Promise.resolve();

export class OrderInputError extends Error {}

function parseItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderInputError('Il carrello è vuoto');
  }

  return items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new OrderInputError('Articolo non valido');
    }

    const { id, quantity } = item;
    if (typeof id === 'string' && id.startsWith('frame:')) {
      const priceCents = getFrameSelectionPriceCents(item.frameSelection);
      if (priceCents === null || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw new OrderInputError('Articolo non valido');
      }

      const selection = item.frameSelection;
      return {
        id: `frame:${[selection.measure, selection.finish, selection.profile, selection.mat].join('|')}`,
        name: 'Cornice su misura',
        price: priceCents / 100,
        quantity,
        frameSelection: { ...selection },
        frameDescription: describeFrameSelection(selection)
      };
    }

    const product = PRODUCTS.find((item) => item.id === Number(id));
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new OrderInputError('Articolo non valido');
    }

    return { id: product.id, name: product.name, price: product.price, quantity };
  });
}

async function readOrders(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const orders = JSON.parse(content);
    if (!Array.isArray(orders)) {
      throw new Error('Il file degli ordini non contiene una lista valida');
    }
    return orders;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function createOrderAndSave(input, filePath) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new OrderInputError('Richiesta non valida');
  }

  const addressErrors = validateShippingAddress(input.address ?? {});
  if (Object.keys(addressErrors).length > 0) {
    throw new OrderInputError('Dati di spedizione non validi');
  }

  if (!PAYMENT_METHODS.some(({ value }) => value === input.paymentMethod)) {
    throw new OrderInputError('Metodo di pagamento non valido');
  }

  const items = parseItems(input.items);
  const cartTotals = calculateCartTotalCents(items);
  const couponCode = typeof input.couponCode === 'string' ? input.couponCode.trim() : '';
  const couponError = couponCode ? validateCouponCode(couponCode, cartTotals.subtotalCents) : null;
  if (couponError || (input.couponCode != null && typeof input.couponCode !== 'string')) {
    throw new OrderInputError(couponError ?? 'Codice coupon non valido');
  }
  const totals = calculateDiscountedCartTotals(items, couponCode);
  const order = {
    number: `ORD-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`,
    status: input.paymentMethod === 'bank-transfer' ? 'In attesa di pagamento' : 'Confermato',
    paymentMethod: input.paymentMethod,
    ...(couponCode ? { couponCode, discountCents: totals.discountCents } : {}),
    items,
    address: {
      name: input.address.name.trim(),
      surname: input.address.surname.trim(),
      address: input.address.address.trim(),
      postalCode: input.address.postalCode.trim(),
      city: input.address.city.trim(),
      phonePrefix: input.address.phonePrefix,
      phone: input.address.phone.trim(),
      email: input.address.email.trim()
    },
    subtotalCents: totals.subtotalCents,
    shippingCents: totals.shippingCents,
    totalCents: totals.totalCents,
    createdAt: new Date().toISOString()
  };
  const orders = await readOrders(filePath);
  orders.push(order);
  await fs.writeFile(filePath, `${JSON.stringify(orders, null, 2)}\n`, { mode: 0o600 });
  return order;
}

export function createOrder(input, filePath = ORDERS_FILE) {
  const task = orderQueue.then(() => createOrderAndSave(input, filePath));
  orderQueue = task.catch(() => {});
  return task;
}
