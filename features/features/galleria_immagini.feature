# language: it

Funzionalità: Galleria di immagini della scheda prodotto
  Come cliente voglio vedere meglio l'articolo attraverso le sue foto
  per valutarlo prima di decidere se comprarlo

  Contesto:
    Dato che voglio vedere le foto dell'articolo "Lampada Lume"
    E nella galleria sono disponibili quattro foto
    E posso navigare sia con le frecce sia con le miniature

  Scenario: Aprire la scheda prodotto e vedere la prima foto
    Dato che sono sulla scheda prodotto "Lampada Lume"
    Allora vedo la foto 1 del carosello
    E vedo le frecce di navigazione e le miniature delle quattro foto
    E posso leggere la descrizione del prodotto

  Scenario: Avanzare alla foto successiva
    Dato che sto guardando la foto 1
    Quando tocco la freccia a destra
    Allora il carosello scorre in avanti
    E viene mostrata la foto 2

  Scenario: Scorrere le foto in successione
    Dato che sto guardando la foto 2
    Quando tocco la freccia a destra
    Allora il carosello scorre in avanti
    E viene mostrata la foto 3

  Scenario: Ricominciare dalla prima foto dopo l'ultima
    Dato che ho visto la foto 4
    Quando tocco la freccia a destra
    Allora viene mostrata la foto 1 del carosello
    E lo scorrimento continua nell'ordine stabilito

  Scenario: Tornare alla foto precedente
    Dato che sto guardando la foto 2
    Quando tocco la freccia a sinistra
    Allora il carosello scorre all'indietro
    E viene mostrata la foto 1

  Scenario: Selezionare una foto con le miniature
    Dato che sto guardando la foto 3
    Quando tocco la miniatura della foto 2
    Allora la foto 2 appare nel riquadro principale
    E sostituisce la foto 3
    E la miniatura della foto 2 è selezionata e ha una trasparenza del 50%

  Scenario: Vedere frecce nere in cerchi color panna
    Dato che sto guardando una foto della Lampada Lume
    Allora le frecce sono nere
    E ogni freccia è racchiusa in un cerchio color panna con trasparenza del 50%
