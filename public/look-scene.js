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
        <svg class="look-room-drawing" viewBox="0 0 600 400" role="img" aria-label="Scena di soggiorno con tavolo, cornice, vaso, lampada e pianta">
          <rect x="0" y="0" width="600" height="300" fill="#e8e1d6" />
          <rect x="0" y="300" width="600" height="100" fill="#cfc5b5" />
          <rect x="270" y="32" width="112" height="128" fill="#75553d" />
          <rect x="280" y="42" width="92" height="108" fill="#f7f3eb" />
          <rect x="294" y="56" width="64" height="80" fill="#c2b199" />
          <rect x="210" y="210" width="300" height="14" rx="4" fill="#8d6b4d" />
          <rect x="230" y="224" width="11" height="76" fill="#75553d" />
          <rect x="480" y="224" width="11" height="76" fill="#75553d" />
          <g transform="translate(55 0)">
            <path d="M373 196h58l-9-28h-40zM402 196v31M386 230h32" fill="none" stroke="#292723" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <path d="M321 209v-16c-9-7-7-19 4-23h19c11 4 13 16 4 23v16z" fill="#c4b59e" stroke="#292723" stroke-width="2" />
          <g transform="translate(50 0)">
            <path d="M69 286c-24-14-31-31-31-47 20 4 33 15 38 35 0-23 12-38 31-44-1 25-9 43-30 55" fill="#9da88d" stroke="#292723" stroke-width="3" stroke-linejoin="round" />
            <path d="M47 286h55l-8 46H55z" fill="#aab29b" stroke="#292723" stroke-width="3" stroke-linejoin="round" />
          </g>
        </svg>
        ${hotspots}
      </div>
      <p class="look-scene-hint">Tocca i punti per scoprire gli oggetti della scena.</p>
    </section>
  `;
}
