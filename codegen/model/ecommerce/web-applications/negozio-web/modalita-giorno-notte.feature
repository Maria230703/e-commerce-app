@c4-id:c01292a7-a13a-2c8a-5335-9de968150c57
Feature: Modalità giorno e notte

  As a cliente del negozio
  I want passare dalla modalità giorno (chiara) alla modalità notte (scura) e viceversa
  So that leggere il sito con i colori che mi affaticano meno gli occhi

  @id(MDLT-GRN-NTT-8TY6QK) @functional @c4-container
  Scenario: Il pulsante giorno/notte sta sotto il logo
    Given sono su una pagina del sito
    When guardo l'intestazione
    Then vedo il pulsante giorno/notte subito sotto il logo "E"

  @id(MDLT-GRN-NTT-7QA35Y) @functional @c4-container
  Scenario: Il pulsante giorno/notte è verde come gli altri pulsanti
    Given sono su una pagina del sito
    When guardo il pulsante giorno/notte
    Then il pulsante è verde
    And ha lo stesso verde degli altri pulsanti del sito

  @id(MDLT-GRN-NTT-72YRBW) @functional @c4-container
  Scenario: In modalità giorno il pulsante mostra un sole bianco
    Given il sito è in modalità giorno
    When guardo il pulsante giorno/notte
    Then vedo un sole stilizzato bianco

  @id(MDLT-GRN-NTT-9ANCZM) @functional @c4-container
  Scenario: Passare alla modalità notte
    Given il sito è in modalità giorno
    When tocco il pulsante giorno/notte
    Then il sito diventa scuro con testi chiari ancora leggibili
    And il pulsante mostra uno spicchio di luna bianco al posto del sole

  @id(MDLT-GRN-NTT-7J2URW) @functional @c4-container
  Scenario: Tornare alla modalità giorno
    Given il sito è in modalità notte
    When tocco il pulsante giorno/notte
    Then il sito torna ai colori chiari
    And il pulsante mostra di nuovo il sole bianco

  @id(MDLT-GRN-NTT-29KNY6) @functional @c4-container
  Scenario: La modalità scelta resta dopo aver ricaricato la pagina e cambiato pagina
    Given ho scelto la modalità notte
    When ricarico la pagina oppure apro il Carrello
    Then il sito resta in modalità notte
    And il pulsante mostra lo spicchio di luna
