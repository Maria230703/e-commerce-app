import { formatCurrency } from '../catalog-logic.js';
import { renderFavoriteButtonMarkup } from './favorites.js';

export const PRODUCT_GALLERY_IMAGES = {
  1: [
    '/product-images/lampada-lume-1.svg',
    '/product-images/lampada-lume-2.svg',
    '/product-images/lampada-lume-3.svg',
    '/product-images/lampada-lume-4.svg'
  ]
};

function renderProductGallery(product, activeImageIndex) {
  const images = PRODUCT_GALLERY_IMAGES[product.id];
  if (!images) {
    return '';
  }

  const selectedIndex = ((activeImageIndex % images.length) + images.length) % images.length;

  return `
    <section class="product-gallery" aria-label="Galleria immagini ${product.name}">
      <div class="product-gallery-main">
        <button class="product-gallery-arrow" type="button" data-gallery-action="previous" aria-label="Foto precedente">‹</button>
        <img
          class="product-gallery-image"
          src="${images[selectedIndex]}"
          alt="${product.name}, foto ${selectedIndex + 1} di ${images.length}"
          data-gallery-main-image
        >
        <button class="product-gallery-arrow" type="button" data-gallery-action="next" aria-label="Foto successiva">›</button>
      </div>
      <div class="product-gallery-thumbnails" aria-label="Seleziona una foto">
        ${images.map((image, index) => `
          <button
            class="product-gallery-thumbnail${index === selectedIndex ? ' is-selected' : ''}"
            type="button"
            data-gallery-index="${index}"
            aria-label="Mostra foto ${index + 1}"
            aria-pressed="${index === selectedIndex}"
          >
            <img src="${image}" alt="">
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

export function renderProductDetailMarkup(product, isFavorite = false, isAddedToCart = false, activeImageIndex = 0) {
  return `
    <section class="product-detail" aria-labelledby="product-detail-title">
      <button class="back-button" type="button">Indietro</button>
      ${renderProductGallery(product, activeImageIndex)}
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
