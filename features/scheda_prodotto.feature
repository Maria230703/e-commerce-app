# language: it
Funzionalità: Scheda prodotto
  Come cliente del negozio
  voglio vedere i dettagli di un articolo
  per decidere se mi interessa

  Schema dello scenario: Aprire la scheda di un articolo
    Dato che sono sulla pagina Scopri
    Quando tocco l'articolo "<articolo>"
    Allora vedo la scheda con nome "<articolo>", prezzo <prezzo> euro e descrizione "<descrizione>"

    Esempi:
      | articolo        | prezzo | descrizione                                                     |
      | Lampada Lume    | 89     | Paralume in lino e base in metallo. Luce calda e diffusa.       |
      | Specchio Orbita | 119    | Specchio tondo con bordo sottile in metallo.                    |
      | Portavaso Trama | 45     | Intreccio in rattan naturale con fondo impermeabile.            |
      | Vaso Duna       | 34     | Ceramica smaltata a mano con finitura opaca.                    |
      | Candela Vaniglia| 22     | Cera vegetale in vasetto di vetro riutilizzabile.               |
      | Cornice Atelier | 29     | Profilo in plastica con vetro antiriflesso.                        |

  Scenario: Tornare al catalogo
    Dato che sto guardando la scheda di "Lampada Lume"
    Quando torno indietro
    Allora mi ritrovo sulla pagina Scopri

  Scenario: Tornare al catalogo mantenendo il filtro
    Dato che ho scelto la categoria "Cornici"
    E sto guardando la scheda di "Cornice Atelier"
    Quando torno indietro
    Allora vedo la pagina Scopri con la categoria "Cornici" selezionata e 1 articolo
      Schema dello scenario: Leggere le informazioni di un articolo
    Dato che sono sulla scheda di "<articolo>"
    Quando guardo le informazioni dell'articolo
    Allora vedo "<voce>": "<valore>"

    Esempi:
      | articolo         | voce        | valore                                                            |
      | Lampada Lume     | Dimensioni  | altezza 45 cm, diametro paralume 28 cm, diametro base 16 cm       |
      | Lampada Lume     | Materiali   | lino, metallo, porta lampadina in acciaio inox                    |
      | Lampada Lume     | Provenienza | Made in Italy                                                     |
      | Specchio Orbita  | Dimensioni  | diametro 100 cm                                                   |
      | Specchio Orbita  | Materiali   | metallo, vetro, retro in truciolato                               |
      | Specchio Orbita  | Provenienza | Made in Italy                                                     |
      | Cornice Atelier  | Dimensioni  | 40 x 60 cm                                                        |
      | Cornice Atelier  | Materiali   | plastica, vetro antiriflesso, retro in sughero, ganci in acciaio  |
      | Cornice Atelier  | Provenienza | Made in Italy                                                     |
      | Candela Vaniglia | Dimensioni  | altezza 10 cm, diametro 8,5 cm, peso della cera 275 g             |
      | Candela Vaniglia | Materiali   | cera vegetale, vasetto in vetro                                   |
      | Candela Vaniglia | Provenienza | Made in Italy                                                     |
      | Portavaso Trama  | Dimensioni  | diametro esterno 34 cm, diametro interno 27 cm, altezza 33 cm     |
      | Portavaso Trama  | Materiali   | rattan naturale, fondo impermeabile                               |
      | Portavaso Trama  | Provenienza | Made in Italy                                                     |
      | Vaso Duna        | Dimensioni  | altezza 40 cm, diametro pancia 22 cm, imboccatura 13 cm, base 11 cm |
      | Vaso Duna        | Materiali   | ceramica smaltata                                                 |
      | Vaso Duna        | Colore      | bianco latte e arancione                                          |
      | Vaso Duna        | Provenienza | Made in Italy                                                     |