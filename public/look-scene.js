export const LOOK_SCENE_PRODUCTS = [
  { id: 6, name: 'Cornice Atelier', position: 'frame' },
  { id: 4, name: 'Vaso Duna', position: 'vase' },
  { id: 1, name: 'Lampada Lume', position: 'lamp' },
  { id: 3, name: 'Portavaso Trama', position: 'plant' }
];

export function renderLookScene() {
  const hotspots = LOOK_SCENE_PRODUCTS.map(
    ({ id, name, position }) => `
      <button
        class="look-hotspot look-hotspot-${position}"
        type="button"
        data-product-id="${id}"
        aria-label="Scopri ${name}"
      >+</button>
    `
  ).join('');

  return `
    <section class="look-scene" aria-labelledby="look-scene-title">
      <header class="look-scene-header">
        <h2 id="look-scene-title">Compra il look</h2>
        <span>Angolo soggiorno</span>
      </header>
      <div class="look-room">
        <img
          class="look-room-image"
          src="/images/scena-soggiorno.jpg"
          alt="Soggiorno con cornice, vaso e lampada sopra un tavolo e portavaso in rattan"
          loading="lazy"
          width="1200"
          height="801"
        >
        ${hotspots}
      </div>
      <p class="look-scene-hint">Tocca i punti per scoprire gli oggetti della scena.</p>
    </section>
  `;
}
