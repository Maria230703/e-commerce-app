export function renderAddToCartButton(product, isAdded, options = {}) {
  const className = options.className ? ` ${options.className}` : '';
  const ariaLabel = options.ariaLabel ?? `Aggiungi ${product.name} al carrello`;
  return `
    <button
      class="add-button${isAdded ? ' is-added' : ''}${className}"
      type="button"
      data-product-id="${product.id}"
      aria-label="${ariaLabel}"
    >${isAdded ? '✓ Aggiunto' : 'Acquista'}</button>
  `;
}
