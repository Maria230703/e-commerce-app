@c4-id:32be3296-6b21-5964-8815-ef0bf817c0ab
Feature: Carrello

  As a cliente del negozio
  I want raccogliere gli articoli che voglio comprare e vedere il totale
  So that decidere cosa acquistare

  # Spedizione 4,90 euro, gratuita da 79,00 euro di subtotale
  @id(CRRL-RGH-E-QNTT-KWT-010) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Carrello vuoto
    Given non ho aggiunto nulla
    When apro il carrello
    Then vedo il messaggio "Il carrello è vuoto"
    And non vedo il pulsante "Vai al pagamento"

  @id(CRRL-RGH-E-QNTT-KWT-020) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il riepilogo non appare nella pagina Scopri
    Given sono sulla pagina Scopri
    When non ho ancora toccato il pulsante Carrello
    Then non vedo il riepilogo del carrello
    And il pulsante Carrello resta visibile nell'intestazione

  @id(CRRL-RGH-E-QNTT-KWT-030) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aprire il carrello dal pulsante
    Given sono sulla pagina Scopri
    When tocco il pulsante Carrello
    Then si apre la pagina del carrello
    And posso vedere il riepilogo e il totale
    And vedo il pulsante "Indietro"

  @id(CRRL-RGH-E-QNTT-KWT-040) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aggiungere un articolo dalla scheda
    Given il carrello è vuoto
    And sto guardando la scheda di "Vaso Duna"
    When tocco "Aggiungi"
    Then il carrello contiene 1 articolo "Vaso Duna" a 34,00 euro
    And l'icona del carrello mostra 1

  @id(CRRL-RGH-E-QNTT-KWT-050) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aggiungere due volte lo stesso articolo
    Given nel carrello c'è 1 articolo "Vaso Duna"
    When aggiungo di nuovo "Vaso Duna" dalla sua scheda
    Then il carrello ha una sola riga "Vaso Duna" con quantità 2
    And l'icona del carrello mostra 2

  @id(CRRL-RGH-E-QNTT-KWT-060) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aumentare la quantità
    Given nel carrello c'è 1 articolo "Vaso Duna"
    When aumento la quantità di "Vaso Duna" a 3
    Then la riga "Vaso Duna" mostra 102,00 euro

  @id(CRRL-RGH-E-QNTT-KWT-070) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Togliere un articolo diminuendo la quantità
    Given nel carrello c'è 1 articolo "Vaso Duna"
    When diminuisco la quantità di "Vaso Duna"
    Then "Vaso Duna" non è più nel carrello
    And vedo il messaggio "Il carrello è vuoto"

  @id(CRRL-RGH-E-QNTT-KWT-080) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: I pulsanti quantità sono ordinati in verticale
    Given nel carrello c'è 1 articolo "Vaso Duna"
    When apro il carrello
    Then il pulsante "+" appare sopra il pulsante "-"

  @id(CRRL-CRNC-PRSN-BCS-010) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aggiungere una cornice personalizzata
    Given il carrello è vuoto
    And sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When tocco "Aggiungi al carrello"
    Then il carrello contiene "Cornice su misura" a 30,90 euro
    And la riga riporta "13x18 cm, Classico, passe-partout Bianco"

  @id(CRRL-CRNC-PRSN-BCS-020) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Cornice personalizzata con foto
    Given sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    And ho caricato il file "mare.jpg"
    When tocco "Aggiungi al carrello"
    Then la riga della cornice riporta "Stampa foto su carta fotografica: omaggio"
    And il prezzo della riga è 30,90 euro

  @id(CRRL-CRNC-PRSN-BCS-030) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Cornici con scelte diverse sono righe separate
    Given nel carrello c'è una cornice 13x18 "Classico", passe-partout "Bianco"
    When aggiungo una cornice 13x18 "Contemporaneo", passe-partout "Bianco"
    Then il carrello ha due righe di cornice
    And il subtotale è 63,80 euro

  @id(SPDZ-STP-010) @functional @c4-container @c4-primary(94d6dcb5-3ead-b352-1700-b2185272c021) @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario Outline: Costo della spedizione
    Given il subtotale del carrello è <subtotale> euro
    When guardo il riepilogo del carrello
    Then la spedizione costa <spedizione> euro
    And il totale è <totale> euro
    Examples:
    | subtotale | spedizione | totale |
    | 34,00     | 4,90       | 38,90  |
    | 78,90     | 4,90       | 83,80  |
    | 79,00     | 0,00       | 79,00  |
    | 123,00    | 0,00       | 123,00 |

  @id(SPDZ-STP-020) @functional @c4-container @c4-primary(94d6dcb5-3ead-b352-1700-b2185272c021) @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Barra della spedizione gratuita
    Given nel carrello c'è 1 articolo "Vaso Duna"
    When guardo il riepilogo del carrello
    Then vedo "Ti mancano 45,00 euro per la spedizione gratuita"

  @id(SPDZ-STP-030) @functional @c4-container @c4-primary(94d6dcb5-3ead-b352-1700-b2185272c021) @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Spedizione gratuita raggiunta
    Given nel carrello c'è 1 articolo "Lampada Lume"
    When guardo il riepilogo del carrello
    Then vedo "Spedizione gratuita sbloccata"

  @id(CRRL-RGH-E-QNTT-KWT-090) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il carrello resta dopo la ricarica
    Given nel carrello c'è 1 articolo "Vaso Duna"
    When ricarico la pagina
    Then il carrello contiene ancora 1 articolo "Vaso Duna"

  @id(CRRL-RGH-E-QNTT-KWT-100) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il pulsante diventa Aggiunto e mantiene la posizione
    Given sono sulla pagina Scopri e il carrello è vuoto
    When tocco "Aggiungi" su "Lampada Lume"
    Then il pulsante di "Lampada Lume" diventa panna e mostra "Aggiunto"
    And il pulsante resta nella stessa posizione
    And gli altri articoli mantengono il pulsante "Aggiungi"

  @id(CRRL-RGH-E-QNTT-KWT-110) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il secondo tocco rimuove l'articolo
    Given "Lampada Lume" è nel carrello
    When tocco di nuovo il pulsante di "Lampada Lume"
    Then "Lampada Lume" non è più nel carrello
    And il pulsante di "Lampada Lume" torna "Aggiungi"

  @id(CRRL-RGH-E-QNTT-KWT-120) @functional @c4-container @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Il pulsante torna normale se l'articolo esce dal carrello
    Given "Lampada Lume" è nel carrello
    When tolgo "Lampada Lume" dal carrello
    Then il pulsante di "Lampada Lume" torna "Aggiungi"
