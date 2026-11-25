@c4-id:c01292a7-a13a-2c8a-5335-9de968150c57
Feature: Palette panna e font unico

  As a cliente del negozio
  I want vedere un sito dai colori caldi color panna, senza verde, e con un solo carattere
  So that leggere il sito in modo uniforme e riconoscerne lo stile

  @id(PLTT-E-FONT-3AQKRP) @functional @c4-container
  Scenario: Nel sito non c'è nessun verde
    Given il sito è in qualunque pagina e modalità
    When guardo i fogli di stile e i file JavaScript
    Then non ci sono tonalità di verde, tranne le opzioni del configuratore e le illustrazioni dei prodotti

  @id(PLTT-E-FONT-92CH3F) @functional @c4-container
  Scenario: La palette è definita in un solo punto
    Given il sito usa i colori panna
    When guardo il foglio di stile
    Then panna, bordo del panna, panna in hover, testo su panna, pallino dei conteggi, bordo dei pulsanti e contorno del focus sono variabili definite in un solo punto

  @id(PLTT-E-FONT-73QEB8) @functional @c4-container
  Scenario: Il panna è usato dove previsto
    Given sono sulla pagina iniziale
    When guardo barra superiore, logo, pulsante carrello, filtro categoria attivo e pulsante "Aggiunto"
    Then tutti usano il panna con il testo scuro su panna
    And i pallini dei conteggi hanno sfondo scuro e testo panna

  @id(PLTT-E-FONT-2JDECG) @functional @c4-container
  Scenario: Il pulsante di acquisto è trasparente con bordo e "Aggiunto" è riconoscibile dal testo
    Given vedo un articolo nel catalogo
    When guardo il pulsante "Aggiungi" normale
    Then ha sfondo trasparente, bordo da 1,5 pixel e testo scuro
    And dopo averlo toccato diventa "Aggiunto", con sfondo panna e cambio di testo oltre che di colore

  @id(PLTT-E-FONT-8N7D2D) @functional @c4-container
  Scenario: Il focus da tastiera ha un contorno scuro
    Given navigo con la tastiera
    When un controllo riceve il focus
    Then ha un contorno scuro di 2 pixel a 2 pixel di distanza

  @id(PLTT-E-FONT-3VRGUJ) @functional @c4-container
  Scenario: Le opzioni del configuratore e le illustrazioni non cambiano colore
    Given sono nel configuratore della cornice
    When guardo i passe-partout, per esempio "Verde smeraldo"
    Then i loro colori sono quelli di prima, come le illustrazioni dei prodotti

  @id(PLTT-E-FONT-5C5H2A) @functional @c4-container
  Scenario: Tutto il sito usa un solo font
    Given sono su una pagina del sito
    When guardo testi, campi, segnaposto, pulsanti ed etichette
    Then usano tutti lo stesso font, definito da una sola variabile, Cambria, Caladea, Georgia, serif

  @id(PLTT-E-FONT-7XFJRW) @functional @c4-container
  Scenario: Il font ha solo due pesi
    Given sono su una pagina del sito
    When guardo i testi
    Then i testi sono a peso 400
    And titoli, nomi degli articoli, prezzi e pulsanti principali sono a peso 700, senza altri pesi

  @id(PLTT-E-FONT-6RQYMU) @functional @c4-container
  Scenario: Si carica solo Caladea in due pesi
    Given la pagina si apre
    When il browser carica i font
    Then carica Caladea nei pesi 400 e 700 e nessun altro font
