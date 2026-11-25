// §REQ:CMPR-IL-LOOK-JMT-010, §REQ:CMPR-IL-LOOK-JMT-030, §REQ:CMPR-IL-LOOK-JMT-050 — scena "Angolo soggiorno": 4 punti che aprono la scheda, senza toccare il catalogo
export const LOOK_SCENE_PRODUCTS = [
  { id: 6, name: 'Cornice Atelier', position: 'frame' },
  { id: 4, name: 'Vaso Duna', position: 'vase' },
  { id: 1, name: 'Lampada Lume', position: 'lamp' },
  { id: 3, name: 'Portavaso Trama', position: 'plant' }
];

// §REQ:TSTT-9E8T7D — sotto la scena, "Vedi tutti gli articoli" scorre fino all'elenco dei prodotti
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
          src="/images/Gemini_Generated_Image_agbiq5agbiq5agbi.jpg"
          alt="Soggiorno con cornice, vaso e lampada sopra un tavolo e portavaso in rattan"
        >
        ${hotspots}
      </div>
      <p class="look-scene-hint">Tocca i punti per scoprire gli oggetti della scena.</p>
    </section>
    <div class="look-scene-actions">
      <button id="see-all-button" class="see-all-button" type="button" aria-label="Vedi tutti gli articoli">Vedi tutti gli articoli</button>
    </div>
  `;
}
