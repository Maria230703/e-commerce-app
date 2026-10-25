# language: it

Funzionalità: Galleria di immagini della scheda prodotto
  Come cliente voglio vedere meglio l'articolo attraverso le sue foto
  per valutarlo prima di decidere se comprarlo

  Contesto:
    Dato che voglio vedere la galleria di un articolo del catalogo
    E nella galleria sono disponibili quattro foto
    E posso navigare sia con le frecce sia con le miniature

  Schema dello scenario: Aprire la scheda prodotto e vedere la prima foto
    Dato che sono sulla scheda prodotto "<articolo>"
    Allora vedo la foto 1 del carosello
    E vedo le frecce di navigazione e le miniature delle quattro foto
    E posso leggere la descrizione del prodotto

    Esempi:
      | articolo         |
      | Lampada Lume     |
      | Specchio Orbita  |
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |
      | Cornice Atelier  |

  Schema dello scenario: Avanzare alla foto successiva
    Dato che sto guardando la foto 1 dell'articolo "<articolo>"
    Quando tocco la freccia a destra
    Allora il carosello scorre in avanti
    E viene mostrata la foto 2 dell'articolo "<articolo>"

    Esempi:
      | articolo         |
      | Lampada Lume     |
      | Specchio Orbita  |
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |
      | Cornice Atelier  |

  Schema dello scenario: Scorrere le foto in successione
    Dato che sto guardando la foto 2 dell'articolo "<articolo>"
    Quando tocco la freccia a destra
    Allora il carosello scorre in avanti
    E viene mostrata la foto 3 dell'articolo "<articolo>"

    Esempi:
      | articolo         |
      | Lampada Lume     |
      | Specchio Orbita  |
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |
      | Cornice Atelier  |

  Schema dello scenario: Ricominciare dalla prima foto dopo l'ultima
    Dato che ho visto la foto 4 dell'articolo "<articolo>"
    Quando tocco la freccia a destra
    Allora viene mostrata la foto 1 dell'articolo "<articolo>" nel carosello
    E lo scorrimento continua nell'ordine stabilito

    Esempi:
      | articolo         |
      | Lampada Lume     |
      | Specchio Orbita  |
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |
      | Cornice Atelier  |

  Schema dello scenario: Tornare alla foto precedente
    Dato che sto guardando la foto 2 dell'articolo "<articolo>"
    Quando tocco la freccia a sinistra
    Allora il carosello scorre all'indietro
    E viene mostrata la foto 1 dell'articolo "<articolo>"

    Esempi:
      | articolo         |
      | Lampada Lume     |
      | Specchio Orbita  |
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |
      | Cornice Atelier  |

  Schema dello scenario: Selezionare una foto con le miniature
    Dato che sto guardando la foto 3 dell'articolo "<articolo>"
    Quando tocco la miniatura della foto <foto_selezionata>
    Allora la foto <foto_selezionata> dell'articolo "<articolo>" appare nel riquadro principale
    E sostituisce la foto 3 dell'articolo "<articolo>"
    E la miniatura della foto <foto_selezionata> è selezionata e ha una trasparenza del 50%

    Esempi:
      | articolo         | foto_selezionata |
      | Lampada Lume     | 2                |
      | Specchio Orbita  | 2                |
      | Portavaso Trama  | 2                |
      | Vaso Duna        | 2                |
      | Candela Vaniglia | 2                |
      | Cornice Atelier  | 2                |

  Schema dello scenario: Vedere frecce nere in cerchi color panna
    Dato che sto guardando una foto dell'articolo "<articolo>"
    Allora le frecce sono nere
    E ogni freccia è racchiusa in un cerchio color panna con trasparenza del 50%

    Esempi:
      | articolo         |
      | Lampada Lume     |
      | Specchio Orbita  |
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |
      | Cornice Atelier  |
