import { formatCurrency } from '../catalog-logic.js';

export const FAVORITES_STORAGE_KEY = 'e-commerce-favorites';
export const EMPTY_FAVORITES_MESSAGE =
  'Tocca il cuore sugli oggetti che ti piacciono: li ritrovi tutti qui.';

export function readFavoriteIds(storage, products) {
  const storedValue = storage.getItem(FAVORITES_STORAGE_KEY);

  if (storedValue === null) {
    return [];
  }

  const favoriteIds = JSON.parse(storedValue);

  if (!Array.isArray(favoriteIds)) {
    throw new TypeError('I preferiti salvati devono essere un elenco di ID.');
  }

  const productIds = new Set(products.map(({ id }) => id));
  return [...new Set(favoriteIds.filter((id) => productIds.has(id)))];
}

export function toggleFavoriteId(favoriteIds, productId) {
  return favoriteIds.includes(productId)
    ? favoriteIds.filter((id) => id !== productId)
    : [...favoriteIds, productId];
}

export function renderFavoriteButtonMarkup(product, isFavorite) {
  const action = isFavorite ? 'Rimuovi' : 'Aggiungi';
  const status = isFavorite ? 'dai' : 'ai';

  return `
    <button
      class="favorite-button ${isFavorite ? 'is-favorite' : ''}"
      type="button"
      data-favorite-product-id="${product.id}"
      aria-label="${action} ${product.name} ${status} preferiti"
      aria-pressed="${isFavorite}"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"></path>
      </svg>
    </button>
  `;
}

export function renderFavoritesMarkup(products) {
  if (!products.length) {
    return `<p class="empty-favorites">${EMPTY_FAVORITES_MESSAGE}</p>`;
  }

  return products.map((product) => `
    <article class="favorite-item">
      <h2>${product.name}</h2>
      <p class="price">${formatCurrency(product.price)}</p>
    </article>
  `).join('');
}
