@c4-id:b73eb991-9966-db35-cc3d-4d91af013e6e @c4-related(c01292a7-a13a-2c8a-5335-9de968150c57)
Feature: Testata della pagina iniziale

  As a cliente del negozio
  I want trovare subito logo, ricerca, preferiti e carrello in una testata ordinata che resta in alto
  So that cercare e raggiungere gli articoli senza perdere i comandi principali mentre scorro

  @id(TSTT-2RHMB5) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: La barra superiore ha il messaggio al centro e lingua e tema a destra
    Given sono sulla pagina iniziale
    When guardo la prima riga
    Then vedo la barra superiore con il messaggio "Primo acquisto: -10% con" e il codice centrati
    And a destra vedo il pulsante della lingua e quello giorno/notte

  @id(TSTT-5YBZQW) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: La testata resta fissa in alto e la barra superiore scorre via
    Given sono sulla pagina iniziale
    When scorro la pagina verso il basso
    Then la barra superiore scorre via
    And la testata della seconda riga resta fissa in alto

  @id(TSTT-4JJJG3) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: Il logo E Shop a sinistra porta alla home
    Given sono su una pagina del sito
    When guardo la testata
    Then a sinistra vedo il logo "E" con la scritta "Shop"
    And toccandolo vado alla home

  @id(TSTT-5BGBBG) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: La ricerca sta al centro e occupa tutto lo spazio libero
    Given sono sulla pagina iniziale
    When guardo la testata
    Then la barra di ricerca sta al centro
    And occupa tutto lo spazio libero tra il logo e i pulsanti a destra

  @id(TSTT-25XBT9) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: Preferiti è un pulsante tondo con cuore e pallino del numero
    Given sono sulla pagina iniziale
    When guardo la testata a destra
    Then vedo "Preferiti" come pulsante tondo con l'icona di un cuore
    And il pallino con il numero compare solo se i preferiti sono più di 0

  @id(TSTT-5PU7GW) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: Carrello è un pulsante a pillola con icona, testo e pallino del numero
    Given sono sulla pagina iniziale
    When guardo la testata a destra
    Then vedo "Carrello" come pulsante a pillola con icona, testo e un pallino con il numero degli articoli

  @id(TSTT-9E8T7D) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: Il pulsante Vedi tutti gli articoli porta all'elenco
    Given sono sulla pagina iniziale e vedo la scena "Compra il look"
    When tocco "Vedi tutti gli articoli" sotto la scena
    Then la pagina scorre fino all'elenco dei prodotti

  @id(TSTT-8VJC9V) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: Tutti i controlli della testata sono veri pulsanti o link con nome e area di 44 pixel
    Given sono su una pagina del sito
    When guardo i controlli della barra superiore e della testata
    Then ognuno è un pulsante o un link con un nome per chi non vede
    And l'area che si può toccare è alta e larga almeno 44 pixel, anche per lingua e tema

  @id(TSTT-27HF7V) @functional @c4-container @wiki(entity-c01292a7-a13a-2c8a-5335-9de968150c57)
  Scenario: I nuovi testi sono tradotti in tutte le lingue del sito
    Given ho scelto Inglese o Spagnolo
    When guardo la barra superiore, la testata e la scena
    Then ogni nuovo testo è nella lingua scelta
