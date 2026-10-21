import {
  CATEGORIES,
  PRODUCTS,
  filterProducts,
  formatCurrency,
  calculateCartTotal,
  transitionCatalogView
} from '/catalog-logic.js';
import { renderProductDetailMarkup } from '/product-detail.js';
import { renderLookScene } from '/look-scene.js';
import {
  FAVORITES_STORAGE_KEY,
  readFavoriteIds,
  renderFavoriteButtonMarkup,
  renderFavoritesMarkup,
  toggleFavoriteId
} from '/favorites.js';

const state = {
  products: PRODUCTS,
  search: '',
  category: 'all',
  sort: 'featured',
  selectedProductId: null,
  favoriteIds: readFavoriteIds(window.localStorage, PRODUCTS),
  cart: []
};

const isFavoritesPage = window.location.pathname === '/preferiti';
const pageTitle = document.querySelector('#page-title');
const lookSceneContainer = document.querySelector('#look-scene-container');
const productList = document.querySelector('#product-list');
const categoryFilters = document.querySelector('#category-filters');
const toolbar = document.querySelector('.toolbar');
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const cartItems = document.querySelector('#cart-items');
const subtotalEl = document.querySelector('#subtotal');
const shippingEl = document.querySelector('#shipping');
const totalEl = document.querySelector('#total');
const cartCountEl = document.querySelector('#cart-count');
const itemsCountEl = document.querySelector('#items-count');
const favoritesCountEl = document.querySelector('#favorites-count');

function renderFavoriteCount() {
  favoritesCountEl.textContent = String(state.favoriteIds.length);
}

function renderFavoritesPage() {
  pageTitle.textContent = 'Preferiti';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  productList.innerHTML = `
    <div class="favorites-page">
      ${renderFavoritesMarkup(
        state.products.filter((product) => state.favoriteIds.includes(product.id))
      )}
      <a class="back-button favorites-back-link" href="/scopri">Torna a Scopri</a>
    </div>
  `;
}

function toggleFavorite(productId) {
  state.favoriteIds = toggleFavoriteId(state.favoriteIds, productId);
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favoriteIds));
  renderFavoriteCount();

  if (state.selectedProductId !== null) {
    renderProducts();
  } else {
    renderProducts();
  }
}

function renderCategoryFilters() {
  categoryFilters.innerHTML = CATEGORIES.map(
    (category) => `
      <button
        type="button"
        class="filter-chip ${state.category === category.value ? 'active' : ''}"
        data-category="${category.value}"
      >
        ${category.label}
      </button>
    `
  ).join('');

  categoryFilters.querySelectorAll('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategoryFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  if (isFavoritesPage) {
    renderFavoritesPage();
    return;
  }

  if (state.selectedProductId !== null) {
    const product = state.products.find((item) => item.id === state.selectedProductId);

    if (product) {
      lookSceneContainer.hidden = true;
      renderProductDetail(product);
      return;
    }

    state.selectedProductId = null;
  }

  pageTitle.textContent = 'Scopri';
  lookSceneContainer.hidden = false;
  toolbar.hidden = false;
  categoryFilters.hidden = false;

  const filteredProducts = filterProducts(state.products, {
    search: state.search,
    category: state.category,
    sort: state.sort
  });

  if (!filteredProducts.length) {
    productList.innerHTML = '<div class="empty-cart">Nessun prodotto trovato con i filtri correnti.</div>';
    return;
  }

  productList.innerHTML = filteredProducts.map((product) => {
    const emojiMap = {
      arredo: '💡',
      oggettistica: '🏺',
      cornici: '🖼️'
    };

    return `
      <article class="product-card">
        <button class="product-detail-button" type="button" data-product-id="${product.id}">
          <div class="product-image" aria-hidden="true">${emojiMap[product.category]}</div>
          <div class="product-body">
            <div class="product-top">
              <span class="badge">${product.badge}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
        </button>
        <div class="product-footer">
          <span class="price">${formatCurrency(product.price)}</span>
          <button class="add-button" type="button" data-product-id="${product.id}">Aggiungi</button>
          ${renderFavoriteButtonMarkup(product, state.favoriteIds.includes(product.id))}
        </div>
      </article>
    `;
  }).join('');

  productList.querySelectorAll('.product-detail-button').forEach((button) => {
    button.addEventListener('click', () => {
      Object.assign(
        state,
        transitionCatalogView(state, {
          type: 'open-product',
          productId: Number(button.dataset.productId)
        })
      );
      renderProducts();
    });
  });

  productList.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.productId);
      const product = state.products.find((item) => item.id === productId);

      if (!product) {
        return;
      }

      const existingItem = state.cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }

      renderCart();
    });
  });

  productList.querySelectorAll('.favorite-button').forEach((button) => {
    button.addEventListener('click', () => {
      toggleFavorite(Number(button.dataset.favoriteProductId));
    });
  });
}

function openProduct(productId) {
  Object.assign(
    state,
    transitionCatalogView(state, {
      type: 'open-product',
      productId
    })
  );
  renderProducts();
}

function renderProductDetail(product) {
  pageTitle.textContent = product.name;
  toolbar.hidden = true;
  categoryFilters.hidden = true;

  productList.innerHTML = renderProductDetailMarkup(
    product,
    state.favoriteIds.includes(product.id)
  );

  productList.querySelector('.back-button').addEventListener('click', () => {
    Object.assign(state, transitionCatalogView(state, { type: 'back-to-catalog' }));
    renderProducts();
  });

  productList.querySelector('.favorite-button').addEventListener('click', () => {
    toggleFavorite(product.id);
  });
}

lookSceneContainer.innerHTML = renderLookScene();
lookSceneContainer.querySelectorAll('.look-hotspot').forEach((button) => {
  button.addEventListener('click', () => {
    openProduct(Number(button.dataset.productId));
  });
});

function renderCart() {
  const { subtotal, shipping, total, itemCount } = calculateCartTotal(state.cart);

  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="empty-cart">Il carrello è vuoto.</div>';
  } else {
    cartItems.innerHTML = state.cart.map((item) => `
      <div class="cart-item">
        <div class="cart-item-name">
          <strong>${item.name}</strong>
          <span>Qtà: ${item.quantity}</span>
        </div>
        <div class="cart-item-price">
          <strong>${formatCurrency(item.price * item.quantity)}</strong>
        </div>
      </div>
    `).join('');
  }

  subtotalEl.textContent = formatCurrency(subtotal);
  shippingEl.textContent = formatCurrency(shipping);
  totalEl.textContent = formatCurrency(total);
  cartCountEl.textContent = String(itemCount);
  itemsCountEl.textContent = `${itemCount} articoli`;
}

searchInput.addEventListener('input', (event) => {
  state.search = event.target.value;
  renderProducts();
});

sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value;
  renderProducts();
});

renderCategoryFilters();
renderFavoriteCount();
renderProducts();
renderCart();
