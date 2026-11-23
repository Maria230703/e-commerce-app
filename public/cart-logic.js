import { PRODUCTS } from '../catalog-logic.js';
import {
  calculateFramePriceCents,
  describeFrameSelection,
  getFrameSelectionPriceCents
} from './frame-logic.js';

export const CART_STORAGE_KEY = 'e-commerce-cart';

// §REQ:CRRL-RGH-E-QNTT-KWT-090
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
        ...createFrameCartItem(selection, storedItem.framePhotoIncluded ? { name: typeof storedItem.framePhotoName === 'string' ? storedItem.framePhotoName : '' } : null),
        quantity
      }];
    }

    const product = products.find((item) => item.id === id);
    return product ? [{ ...product, quantity }] : [];
  });
}

// §REQ:CRRL-RGH-E-QNTT-KWT-090
export function persistCart(storage, cart) {
  storage.setItem(CART_STORAGE_KEY, JSON.stringify(
    cart.map(({ id, quantity, frameSelection, framePhotoIncluded, framePhotoName }) => ({
      id, quantity, frameSelection, framePhotoIncluded, framePhotoName
    }))
  ));
}

export function getFrameCartId(selection) {
  return `frame:${[selection.measure, selection.profile, selection.mat].join('|')}`;
}

export const FRAME_PHOTO_PRINT_NOTE = 'Stampa foto su carta fotografica: omaggio';

// §REQ:CRRL-CRNC-PRSN-BCS-010, §REQ:CRRL-CRNC-PRSN-BCS-020, §REQ:CRRL-CRNC-PRSN-BCS-030, §REQ:PGMN-EST-ORDN-PEC-070
export function createFrameCartItem(selection, photo = null) {
  const hasPhoto = Boolean(photo);
  const description = describeFrameSelection(selection);
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
    frameDescription: hasPhoto ? `${description}, ${FRAME_PHOTO_PRINT_NOTE}` : description,
    framePhotoIncluded: hasPhoto,
    ...(hasPhoto && photo.name ? { framePhotoName: photo.name } : {})
  };
}

export function isItemInCart(cart, id) {
  return cart.some((item) => item.id === id);
}

// §REQ:CRRL-RGH-E-QNTT-KWT-040
export function addProductToCart(cart, product) {
  return [...cart, { ...product, quantity: 1 }];
}

// §REQ:CRRL-RGH-E-QNTT-KWT-120
export function removeFromCart(cart, id) {
  return cart.filter((item) => item.id !== id);
}

// §REQ:CRRL-RGH-E-QNTT-KWT-100, §REQ:CRRL-RGH-E-QNTT-KWT-110
export function toggleProductInCart(cart, product) {
  return isItemInCart(cart, product.id)
    ? removeFromCart(cart, product.id)
    : addProductToCart(cart, product);
}

// §REQ:CRRL-RGH-E-QNTT-KWT-060, §REQ:CRRL-RGH-E-QNTT-KWT-070
export function changeCartQuantity(cart, id, change) {
  return cart
    .map((item) => (item.id === id ? { ...item, quantity: item.quantity + change } : item))
    .filter((item) => item.quantity > 0);
}

// §REQ:CRRL-RGH-E-QNTT-KWT-040
export function getCartItemCount(cart) {
  return cart.reduce((count, item) => count + item.quantity, 0);
}
