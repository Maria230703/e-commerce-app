# language: it
Funzionalità: Compra il look
  Come cliente del negozio
  voglio vedere gli oggetti abbinati in una stanza
  per trovare ispirazione e arrivare agli articoli che mi piacciono

  Scenario: Vedere la scena prima del catalogo
    Quando apro la pagina Scopri
    Allora vedo la scena "Angolo soggiorno" con 4 punti cliccabili
    E la scena compare sopra l'elenco degli articoli

  Schema dello scenario: Aprire un articolo dalla scena
    Dato che sono sulla pagina Scopri
    Quando tocco il punto di "<articolo>" sulla scena
    Allora vedo la scheda con nome "<articolo>" e prezzo <prezzo> euro

    Esempi:
      | articolo        | prezzo |
      | Cornice Atelier | 29     |
      | Lampada Lume    | 89     |
      | Vaso Duna       | 34     |
      | Portavaso Trama | 45     |

  Scenario: Tornare alla scena dalla scheda
    Dato che ho aperto la scheda di "Lampada Lume" dalla scena
    Quando torno indietro
    Allora mi ritrovo sulla pagina Scopri con la scena visibile

  Scenario: La scena non cambia il catalogo
    Quando apro la pagina Scopri
    Allora sotto la scena vedo ancora 6 articoli