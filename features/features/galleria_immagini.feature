@c4-id:37f816a0-7bf6-7916-6560-d364f7a06cd1
Feature: Galleria di immagini della scheda prodotto

  As a cliente
  I want vedere meglio l'articolo attraverso le sue foto
  So that valutarlo prima di decidere se comprarlo

  Background:
    Given voglio vedere la galleria di un articolo del catalogo
    And sono disponibili tutte le foto fornite per quell'articolo
    And posso navigare sia con le frecce sia con le miniature

  @id(GLLR-IMMG-NNT-010) @functional @c4-container @wiki(entity-37f816a0-7bf6-7916-6560-d364f7a06cd1)
  Scenario Outline: Aprire la scheda prodotto e vedere la prima foto
    Given sono sulla scheda prodotto "<articolo>"
    When guardo la scheda
    Then vedo la foto 1 del carosello
    And vedo le frecce di navigazione e le miniature delle <numero_foto> foto disponibili
    And posso leggere la descrizione del prodotto
    Examples:
    | articolo         | numero_foto |
    | Lampada Lume     | 4           |
    | Specchio Orbita  | 2           |
    | Portavaso Trama  | 3           |
    | Vaso Duna        | 3           |
    | Candela Vaniglia | 3           |
    | Cornice Atelier  | 2           |

  @id(GLLR-IMMG-NNT-020) @functional @c4-container @wiki(entity-37f816a0-7bf6-7916-6560-d364f7a06cd1)
  Scenario Outline: Avanzare alla foto successiva
    Given sto guardando la foto 1 dell'articolo "<articolo>"
    When tocco la freccia a destra
    Then il carosello scorre in avanti
    And viene mostrata la foto 2 dell'articolo "<articolo>"
    Examples:
    | articolo         |
    | Lampada Lume     |
    | Specchio Orbita  |
    | Portavaso Trama  |
    | Vaso Duna        |
    | Candela Vaniglia |
    | Cornice Atelier  |

  @id(GLLR-IMMG-NNT-030) @functional @c4-container @wiki(entity-37f816a0-7bf6-7916-6560-d364f7a06cd1)
  Scenario Outline: Scorrere le foto in successione
    Given sto guardando la foto 2 dell'articolo "<articolo>"
    When tocco la freccia a destra
    Then il carosello scorre in avanti
    And viene mostrata la foto 3 dell'articolo "<articolo>"
    Examples:
    | articolo         |
    | Lampada Lume     |
    | Portavaso Trama  |
    | Vaso Duna        |
    | Candela Vaniglia |

  @id(GLLR-IMMG-NNT-040) @functional @c4-container @wiki(entity-37f816a0-7bf6-7916-6560-d364f7a06cd1)
  Scenario Outline: Ricominciare dalla prima foto dopo l'ultima
    Given sto guardando la foto <ultima_foto> di <numero_foto> nella scheda di "<articolo>"
    When tocco la freccia a destra
    Then vedo la foto 1 di <numero_foto>
    And lo scorrimento continua nell'ordine stabilito
    Examples:
    | articolo         | ultima_foto | numero_foto |
    | Lampada Lume     | 4           | 4           |
    | Specchio Orbita  | 2           | 2           |
    | Portavaso Trama  | 3           | 3           |
    | Vaso Duna        | 3           | 3           |
    | Candela Vaniglia | 3           | 3           |
    | Cornice Atelier  | 2           | 2           |

  @id(GLLR-IMMG-NNT-050) @functional @c4-container @wiki(entity-37f816a0-7bf6-7916-6560-d364f7a06cd1)
  Scenario Outline: Tornare alla foto precedente
    Given sto guardando la foto 2 dell'articolo "<articolo>"
    When tocco la freccia a sinistra
    Then il carosello scorre all'indietro
    And viene mostrata la foto 1 dell'articolo "<articolo>"
    Examples:
    | articolo         |
    | Lampada Lume     |
    | Specchio Orbita  |
    | Portavaso Trama  |
    | Vaso Duna        |
    | Candela Vaniglia |
    | Cornice Atelier  |

  @id(GLLR-IMMG-NNT-060) @functional @c4-container @wiki(entity-37f816a0-7bf6-7916-6560-d364f7a06cd1)
  Scenario Outline: Selezionare una foto con le miniature
    Given sto guardando la foto 2 dell'articolo "<articolo>"
    When tocco la miniatura della foto 1
    Then la foto 1 dell'articolo "<articolo>" appare nel riquadro principale
    And sostituisce la foto 2 dell'articolo "<articolo>"
    And la miniatura della foto 1 è selezionata e ha una trasparenza del 50%
    Examples:
    | articolo         |
    | Lampada Lume     |
    | Specchio Orbita  |
    | Portavaso Trama  |
    | Vaso Duna        |
    | Candela Vaniglia |
    | Cornice Atelier  |

  @id(GLLR-IMMG-NNT-070) @functional @c4-container @wiki(entity-37f816a0-7bf6-7916-6560-d364f7a06cd1)
  Scenario Outline: Vedere frecce nere in cerchi color panna
    Given sto guardando una foto dell'articolo "<articolo>"
    When guardo le frecce di navigazione
    Then le frecce sono nere
    And ogni freccia è racchiusa in un cerchio color panna con trasparenza del 50%
    Examples:
    | articolo         |
    | Lampada Lume     |
    | Specchio Orbita  |
    | Portavaso Trama  |
    | Vaso Duna        |
    | Candela Vaniglia |
    | Cornice Atelier  |
