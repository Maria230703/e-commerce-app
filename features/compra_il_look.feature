@c4-id:98f295c7-ba88-5b12-290b-815a8c0ac139
Feature: Compra il look

  As a cliente del negozio
  I want vedere gli oggetti abbinati in una stanza
  So that trovare ispirazione e arrivare agli articoli che mi piacciono

  @id(CMPR-IL-LOOK-JMT-010) @functional @c4-container
  Scenario: Vedere la scena prima del catalogo
    Given il negozio ha 6 articoli
    When apro la pagina Scopri
    Then vedo la scena "Angolo soggiorno" con 4 punti cliccabili
    And la scena compare sopra l'elenco degli articoli

  @id(CMPR-IL-LOOK-JMT-020) @functional @c4-container
  Scenario: Vedere il titolo sopra la ricerca
    Given il negozio ha 6 articoli
    When apro la pagina Scopri
    Then vedo "Scopri" sotto la scena "Compra il look"
    And vedo "Scopri" prima del campo di ricerca

  @id(CMPR-IL-LOOK-JMT-030) @functional @c4-container
  Scenario Outline: Aprire un articolo dalla scena
    Given sono sulla pagina Scopri
    When tocco il punto di "<articolo>" sulla scena
    Then vedo la scheda con nome "<articolo>" e prezzo <prezzo> euro
    Examples:
    | articolo        | prezzo |
    | Cornice Atelier | 29     |
    | Lampada Lume    | 89     |
    | Vaso Duna       | 34     |
    | Portavaso Trama | 45     |

  @id(CMPR-IL-LOOK-JMT-040) @functional @c4-container
  Scenario: Tornare alla scena dalla scheda
    Given ho aperto la scheda di "Lampada Lume" dalla scena
    When torno indietro
    Then mi ritrovo sulla pagina Scopri con la scena visibile

  @id(CMPR-IL-LOOK-JMT-050) @functional @c4-container
  Scenario: La scena non cambia il catalogo
    Given il negozio ha 6 articoli
    When apro la pagina Scopri
    Then sotto la scena vedo ancora 6 articoli
