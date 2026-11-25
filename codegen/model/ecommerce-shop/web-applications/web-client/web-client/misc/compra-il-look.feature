@c4-id:876e857c-9998-8a9a-9403-f33e270abf76
Feature: Compra il look

  As a cliente del negozio
  I want vedere gli oggetti abbinati in una stanza
  So that trovare ispirazione e arrivare agli articoli che mi piacciono

  @id(CMPR-IL-LOOK-JMT-010) @functional @c4-component @wiki(entity-98f295c7-ba88-5b12-290b-815a8c0ac139)
  Scenario: Vedere la scena prima del catalogo
    Given che il negozio ha 6 articoli
    When apro la pagina Scopri
    Then vedo la scena "Angolo soggiorno" con 4 punti cliccabili
    And la scena compare sopra l'elenco degli articoli

  @id(CMPR-IL-LOOK-JMT-020) @functional @c4-component @wiki(entity-98f295c7-ba88-5b12-290b-815a8c0ac139)
  Scenario: Vedere il titolo sotto la scena e prima dell'ordinamento
    Given il negozio ha 6 articoli
    When apro la pagina Scopri
    Then vedo "Scopri" sotto la scena "Compra il look"
    And vedo "Scopri" prima del campo "Ordina per"
    And la ricerca sta nella testata fissa in alto, non più sotto il titolo

  @id(CMPR-IL-LOOK-JMT-030) @functional @c4-component @wiki(entity-98f295c7-ba88-5b12-290b-815a8c0ac139)
  Scenario Outline: Aprire un articolo dalla scena
    Given che sono sulla pagina Scopri
    When tocco il punto di "<articolo>" sulla scena
    Then vedo la scheda con nome "<articolo>" e prezzo <prezzo> euro
    Examples:
    | articolo | prezzo |
    | Cornice Atelier | 29 |
    | Lampada Lume | 89 |
    | Vaso Duna | 34 |
    | Portavaso Trama | 45 |

  @id(CMPR-IL-LOOK-JMT-040) @functional @c4-component @wiki(entity-98f295c7-ba88-5b12-290b-815a8c0ac139)
  Scenario: Tornare alla scena dalla scheda
    Given che ho aperto la scheda di "Lampada Lume" dalla scena
    When torno indietro
    Then mi ritrovo sulla pagina Scopri con la scena visibile

  @id(CMPR-IL-LOOK-JMT-050) @functional @c4-component @wiki(entity-98f295c7-ba88-5b12-290b-815a8c0ac139)
  Scenario: La scena non cambia il catalogo
    Given che il negozio ha 6 articoli
    When apro la pagina Scopri
    Then sotto la scena vedo ancora 6 articoli
