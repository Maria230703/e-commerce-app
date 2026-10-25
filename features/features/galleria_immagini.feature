# language: it

Funzionalità: Galleria di immagini della scheda prodotto
  Come cliente voglio vedere meglio l'articolo attraverso le sue foto
  per valutarlo prima di decidere se comprarlo

  Contesto:
    Dato che voglio vedere la galleria di un articolo del catalogo
    E sono disponibili tutte le foto fornite per quell'articolo
    E posso navigare sia con le frecce sia con le miniature

  Schema dello scenario: Aprire la scheda prodotto e vedere la prima foto
    Dato che sono sulla scheda prodotto "<articolo>"
    Allora vedo la foto 1 del carosello
    E vedo le frecce di navigazione e le miniature delle <numero_foto> foto disponibili
    E posso leggere la descrizione del prodotto

    Esempi:
      | articolo         | numero_foto |
      | Lampada Lume     | 4           |
      | Specchio Orbita  | 2           |
      | Portavaso Trama  | 3           |
      | Vaso Duna        | 3           |
      | Candela Vaniglia | 3           |
      | Cornice Atelier  | 2           |

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
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |

  Schema dello scenario: Ricominciare dalla prima foto dopo l'ultima
    Dato che sto guardando la foto <ultima_foto> di <numero_foto> nella scheda di "<articolo>"
    Quando tocco la freccia a destra
    Allora vedo la foto 1 di <numero_foto>
    E lo scorrimento continua nell'ordine stabilito

    Esempi:
      | articolo         | ultima_foto | numero_foto |
      | Lampada Lume     | 4           | 4           |
      | Specchio Orbita  | 2           | 2           |
      | Portavaso Trama  | 3           | 3           |
      | Vaso Duna        | 3           | 3           |
      | Candela Vaniglia | 3           | 3           |
      | Cornice Atelier  | 2           | 2           |

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
    Dato che sto guardando la foto 2 dell'articolo "<articolo>"
    Quando tocco la miniatura della foto 1
    Allora la foto 1 dell'articolo "<articolo>" appare nel riquadro principale
    E sostituisce la foto 2 dell'articolo "<articolo>"
    E la miniatura della foto 1 è selezionata e ha una trasparenza del 50%

    Esempi:
      | articolo         |
      | Lampada Lume     |
      | Specchio Orbita  |
      | Portavaso Trama  |
      | Vaso Duna        |
      | Candela Vaniglia |
      | Cornice Atelier  |

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
