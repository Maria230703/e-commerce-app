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
      | Cornice Atelier | 29     | Profilo in legno con vetro antiriflesso.                        |

  Scenario: Tornare al catalogo
    Dato che sto guardando la scheda di "Lampada Lume"
    Quando torno indietro
    Allora mi ritrovo sulla pagina Scopri

  Scenario: Tornare al catalogo mantenendo il filtro
    Dato che ho scelto la categoria "Cornici"
    E sto guardando la scheda di "Cornice Atelier"
    Quando torno indietro
    Allora vedo la pagina Scopri con la categoria "Cornici" selezionata e 1 articolo
    