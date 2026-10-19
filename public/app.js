import { CATEGORIES, PRODUCTS, filterProducts, formatCurrency, calculateCartTotal } from '/catalog-logic.js';

const state = {
  products: PRODUCTS,
  search: '',
  category: 'all',
  sort: 'featured',
  cart: []
};

const productList = document.querySelector('#product-list');
const categoryFilters = document.querySelector('#category-filters');
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const cartItems = document.querySelector('#cart-items');
const subtotalEl = document.querySelector('#subtotal');
const shippingEl = document.querySelector('#shipping');
const totalEl = document.querySelector('#total');
const cartCountEl = document.querySelector('#cart-count');
const itemsCountEl = document.querySelector('#items-count');

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
        <div class="product-image" aria-hidden="true">${emojiMap[product.category]}</div>
        <div class="product-body">
          <div class="product-top">
            <span class="badge">${product.badge}</span>
          </div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-footer">
            <span class="price">${formatCurrency(product.price)}</span>
            <button class="add-button" type="button" data-product-id="${product.id}">Aggiungi</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

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
}

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
renderProducts();
renderCart();
