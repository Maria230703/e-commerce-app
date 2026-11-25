@c4-id:b48a0591-79d6-d2bc-e92e-bacbd2a1fb57
Feature: Lingua del sito

  As a cliente del negozio
  I want scegliere la lingua del sito tra italiano, inglese e spagnolo
  So that leggere tutte le parole e le frasi del negozio nella lingua che capisco meglio

  @id(LNG-7ZCWHN) @functional @c4-component
  Scenario: Il pulsante mostra ITA quando il sito è in italiano
    Given sono sulla pagina Scopri e il sito è in italiano
    When guardo il pulsante della lingua
    Then il pulsante mostra "ITA"

  @id(LNG-7T2YSF) @functional @c4-component
  Scenario: Il pulsante sta a destra nella barra superiore
    Given sono sulla pagina Scopri
    When guardo la barra superiore
    Then il pulsante della lingua sta a destra nella barra superiore, accanto al pulsante giorno/notte
    And l'area che si può toccare è alta e larga almeno 44 pixel

  @id(LNG-9HRNHM) @functional @c4-component
  Scenario: Il pulsante usa i colori panna e nessun verde
    Given sono sulla pagina Scopri
    When guardo il pulsante della lingua
    Then il pulsante ha sfondo trasparente, bordo e testo nei colori della palette panna
    And nel sito non c'è nessun verde

  @id(LNG-674RJD) @functional @c4-component
  Scenario: Aprire la barra delle lingue
    Given sono sulla pagina Scopri e il sito è in italiano
    When tocco il pulsante della lingua
    Then si apre una barra come quella di "Ordina per"
    And la barra offre "Inglese" e "Spagnolo"

  @id(LNG-9ERFZM) @functional @c4-component
  Scenario: Scegliere l'inglese
    Given ho aperto la barra delle lingue
    When scelgo "Inglese"
    Then il pulsante mostra "ENG"
    And la barra si chiude
    And le parole e le frasi del sito sono in inglese

  @id(LNG-7WEBWK) @functional @c4-component
  Scenario: Scegliere lo spagnolo
    Given ho aperto la barra delle lingue
    When scelgo "Spagnolo"
    Then il pulsante mostra "ESP"
    And la barra si chiude
    And le parole e le frasi del sito sono in spagnolo

  @id(LNG-3Q3RDZ) @functional @c4-component
  Scenario: Tornare all'italiano o passare all'altra lingua
    Given il sito è in inglese e il pulsante mostra "ENG"
    When tocco il pulsante della lingua
    Then la barra offre "Italiano" e "Spagnolo"
    And scegliendo "Italiano" il pulsante mostra "ITA" e il sito torna in italiano

  @id(LNG-6A3P6V) @functional @c4-component
  Scenario: Tutti i testi del sito si traducono in automatico
    Given ho scelto "Inglese" o "Spagnolo"
    When apro una pagina del sito tra catalogo, scheda prodotto, carrello, preferiti, pagamento e configuratore cornice
    Then nessuna parola o frase fissa della pagina resta in italiano

  @id(LNG-5R75GQ) @functional @c4-component
  Scenario: I nomi dei prodotti restano uguali e le descrizioni si traducono
    Given ho scelto "Inglese" o "Spagnolo"
    When vedo un articolo, per esempio "Vaso Duna"
    Then il nome "Vaso Duna" resta invariato
    And la descrizione dell'articolo è nella lingua scelta

  @id(LNG-9NBEVB) @functional @c4-component
  Scenario: Il pulsante della lingua compare solo nella landing page
    Given sono su una pagina diversa da Scopri, per esempio Carrello
    When guardo l'intestazione
    Then non vedo il pulsante della lingua

  @id(LNG-6AEYMD) @functional @c4-component
  Scenario: La lingua scelta resta dopo aver ricaricato la pagina e cambiato pagina
    Given ho scelto "Spagnolo"
    When ricarico la pagina oppure apro il Carrello
    Then il sito resta in spagnolo
    And tornando su Scopri il pulsante mostra "ESP"
