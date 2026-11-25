@c4-id:24c5e321-e194-8b73-99c5-cf13f4e84793
Feature: Carrello: righe, quantità e persistenza

  As a cliente del negozio
  I want raccogliere gli articoli che voglio comprare e vedere il totale
  So that decidere cosa acquistare

  @id(CRRL-RGH-E-QNTT-KWT-010) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Carrello vuoto
    Given che non ho aggiunto nulla
    When apro il carrello
    Then vedo il messaggio "Il carrello è vuoto"
    And non vedo il pulsante "Vai al pagamento"

  @id(CRRL-RGH-E-QNTT-KWT-020) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il riepilogo non appare nella pagina Scopri
    Given che sono sulla pagina Scopri
    When non ho ancora toccato il pulsante Carrello
    Then non vedo il riepilogo del carrello
    And il pulsante Carrello resta visibile nell'intestazione

  @id(CRRL-RGH-E-QNTT-KWT-030) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aprire il carrello dal pulsante
    Given che sono sulla pagina Scopri
    When tocco il pulsante Carrello
    Then si apre la pagina del carrello
    And posso vedere il riepilogo e il totale
    And vedo il pulsante "Indietro"

  @id(CRRL-RGH-E-QNTT-KWT-040) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aggiungere un articolo dalla scheda
    Given che il carrello è vuoto
    And sto guardando la scheda di "Vaso Duna"
    When tocco "Aggiungi"
    Then il carrello contiene 1 articolo "Vaso Duna" a 34,00 euro
    And l'icona del carrello mostra 1

  @id(CRRL-RGH-E-QNTT-KWT-050) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aumentare di uno la quantità dal carrello
    Given che nel carrello c'è 1 articolo "Vaso Duna"
    When tocco "+" sulla riga "Vaso Duna"
    Then il carrello ha una sola riga "Vaso Duna" con quantità 2
    And l'icona del carrello mostra 2

  @id(CRRL-RGH-E-QNTT-KWT-060) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aumentare la quantità
    Given che nel carrello c'è 1 articolo "Vaso Duna"
    When aumento la quantità di "Vaso Duna" a 3
    Then la riga "Vaso Duna" mostra 102,00 euro

  @id(CRRL-RGH-E-QNTT-KWT-070) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Togliere un articolo diminuendo la quantità
    Given che nel carrello c'è 1 articolo "Vaso Duna"
    When diminuisco la quantità di "Vaso Duna"
    Then "Vaso Duna" non è più nel carrello
    And vedo il messaggio "Il carrello è vuoto"

  @id(CRRL-RGH-E-QNTT-KWT-080) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: I pulsanti quantità sono ordinati in verticale
    Given che nel carrello c'è 1 articolo "Vaso Duna"
    When apro il carrello
    Then il pulsante "+" appare sopra il pulsante "-"

  @id(CRRL-RGH-E-QNTT-KWT-090) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il carrello resta dopo la ricarica
    Given che nel carrello c'è 1 articolo "Vaso Duna"
    When ricarico la pagina
    Then il carrello contiene ancora 1 articolo "Vaso Duna"

  @id(CRRL-RGH-E-QNTT-KWT-100) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il pulsante Aggiungi diventa Aggiunto mantenendo la posizione
    Given che sono sulla pagina Scopri e il carrello è vuoto
    When tocco "Aggiungi" su "Lampada Lume"
    Then il pulsante di "Lampada Lume" diventa panna e mostra "Aggiunto"
    And il pulsante resta nella stessa posizione
    And gli altri articoli mantengono il pulsante "Aggiungi"

  @id(CRRL-RGH-E-QNTT-KWT-110) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il secondo tocco rimuove l'articolo dal carrello
    Given che "Lampada Lume" è nel carrello e il suo pulsante mostra "Aggiunto"
    When tocco di nuovo il pulsante di "Lampada Lume"
    Then "Lampada Lume" non è più nel carrello
    And il pulsante di "Lampada Lume" torna "Aggiungi"

  @id(CRRL-RGH-E-QNTT-KWT-120) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il pulsante torna normale se l'articolo esce dal carrello
    Given che "Lampada Lume" è nel carrello
    When tolgo "Lampada Lume" dal carrello
    Then il pulsante di "Lampada Lume" torna "Aggiungi"
