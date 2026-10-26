import { PRODUCTS } from '../catalog-logic.js';
import {
  calculateFramePriceCents,
  describeFrameSelection,
  getFrameSelectionPriceCents
} from './frame-logic.js';

export const CART_STORAGE_KEY = 'e-commerce-cart';

export function restoreCart(storage, products = PRODUCTS) {
  const storedValue = storage.getItem(CART_STORAGE_KEY);
  if (storedValue === null) {
    return [];
  }

  const storedItems = JSON.parse(storedValue);
  if (!Array.isArray(storedItems)) {
    throw new TypeError('Il carrello salvato deve essere un elenco di articoli.');
  }

  return storedItems.flatMap((storedItem) => {
    if (!storedItem || typeof storedItem !== 'object' || Array.isArray(storedItem)) {
      return [];
    }

    const { id, quantity } = storedItem;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return [];
    }

    if (storedItem.frameSelection) {
      const selection = storedItem.frameSelection;
      const priceCents = getFrameSelectionPriceCents(selection);
      if (priceCents === null) {
        return [];
      }
      return [{
        ...createFrameCartItem(selection),
        quantity
      }];
    }

    const product = products.find((item) => item.id === id);
    return product ? [{ ...product, quantity }] : [];
  });
}

export function persistCart(storage, cart) {
  storage.setItem(CART_STORAGE_KEY, JSON.stringify(
    cart.map(({ id, quantity, frameSelection }) => ({ id, quantity, frameSelection }))
  ));
}

export function getFrameCartId(selection) {
  return `frame:${[selection.measure, selection.profile, selection.mat].join('|')}`;
}

export function createFrameCartItem(selection) {
  return {
    id: getFrameCartId(selection),
    name: 'Cornice su misura',
    price: calculateFramePriceCents(selection) / 100,
    quantity: 1,
    frameSelection: {
      measure: selection.measure,
      profile: selection.profile,
      mat: selection.mat
    },
    frameDescription: describeFrameSelection(selection)
  };
}

export function isItemInCart(cart, id) {
  return cart.some((item) => item.id === id);
}
