import { formatCurrency } from '../catalog-logic.js';

export function renderProductDetailMarkup(product) {
  return `
    <section class="product-detail" aria-labelledby="product-detail-title">
      <button class="back-button" type="button">Indietro</button>
      <h2 id="product-detail-title">${product.name}</h2>
      <p class="price">${formatCurrency(product.price)}</p>
      <p class="product-detail-description">${product.description}</p>
    </section>
  `;
}
