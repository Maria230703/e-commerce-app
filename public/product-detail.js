import { formatCurrency } from '../catalog-logic.js';
import { renderFavoriteButtonMarkup } from './favorites.js';

export function renderProductDetailMarkup(product, isFavorite = false, isAddedToCart = false) {
  return `
    <section class="product-detail" aria-labelledby="product-detail-title">
      <button class="back-button" type="button">Indietro</button>
      <h2 id="product-detail-title">${product.name}</h2>
      <div class="product-detail-price-row">
        <p class="price">${formatCurrency(product.price)}</p>
        ${renderFavoriteButtonMarkup(product, isFavorite)}
      </div>
      <p class="product-detail-description">${product.description}</p>
      <button
        class="add-button product-detail-add-button${isAddedToCart ? ' is-added' : ''}"
        type="button"
        data-product-id="${product.id}"
        aria-label="Aggiungi ${product.name} al carrello"
      >${isAddedToCart ? '✓ Aggiunto' : 'Acquista'}</button>
    </section>
  `;
}
