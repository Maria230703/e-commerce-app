@c4-id:bd43ab9c-56da-6742-9ed3-b1f2db1b2019
Feature: Pagamento

  As a cliente del negozio
  I want inserire i dati di spedizione e scegliere come pagare
  So that completare il mio acquisto

  # Il pagamento è simulato: nessun addebito reale e nessun dato di carta salvato
  # Metodi disponibili: carta di credito, PayPal, bonifico bancario
  Background:
    Given nel carrello c'è 1 articolo "Vaso Duna"
    And il totale è 38,90 euro

  @id(PGMN-DATI-DI-SPDZ-ICN-010) @functional @c4-container
  Scenario: Andare al pagamento dal carrello
    When tocco "Vai al pagamento"
    Then vedo la pagina con i dati di spedizione e la scelta del metodo di pagamento

  @id(PGMN-DATI-DI-SPDZ-ICN-020) @functional @c4-container
  Scenario: Pagamento non disponibile con il carrello vuoto
    Given svuoto il carrello
    When apro il carrello
    Then non vedo il pulsante "Vai al pagamento"

  @id(PGMN-DATI-DI-SPDZ-ICN-030) @functional @c4-container
  Scenario: Metodi di pagamento disponibili
    When sono sulla pagina del pagamento
    Then vedo i metodi "Carta di credito", "PayPal" e "Bonifico bancario"
    And nessun metodo è già selezionato

  @id(PGMN-DATI-DI-SPDZ-ICN-040) @functional @c4-container
  Scenario Outline: Dati di spedizione obbligatori
    Given sono sulla pagina del pagamento
    And compilo tutti i dati di spedizione tranne "<campo>"
    When tocco "Conferma ordine"
    Then vedo il messaggio "<messaggio>"
    And l'ordine non viene confermato
    Examples:
    | campo              | messaggio                        |
    | Nome               | Inserisci il nome                |
    | Cognome            | Inserisci il cognome             |
    | Indirizzo          | Inserisci l'indirizzo            |
    | Città              | Inserisci la città               |
    | CAP                | Inserisci il CAP                 |
    | Numero di telefono | Inserisci il numero di telefono |
    | Email              | Inserisci l'email                |

  @id(PGMN-DATI-DI-SPDZ-ICN-050) @functional @c4-container
  Scenario: Inserire un numero di telefono con prefisso europeo
    Given sono sulla pagina del pagamento
    When inserisco il numero di telefono "3331234567"
    And seleziono il prefisso "+33"
    Then il prefisso "+33" è selezionato per il numero di telefono

  @id(PGMN-DATI-DI-SPDZ-ICN-060) @functional @c4-container
  Scenario: CAP non valido
    Given sono sulla pagina del pagamento
    When inserisco il CAP "123"
    Then vedo il messaggio "Il CAP deve avere 5 cifre"

  @id(PGMN-DATI-DI-SPDZ-ICN-070) @functional @c4-container
  Scenario: Email non valida
    Given sono sulla pagina del pagamento
    When inserisco l'email "maria.esempio.it"
    Then vedo il messaggio "Inserisci un'email valida"

  @id(PGMN-DATI-DI-SPDZ-ICN-080) @functional @c4-container
  Scenario: Nessun metodo di pagamento scelto
    Given ho compilato correttamente i dati di spedizione
    When tocco "Conferma ordine"
    Then vedo il messaggio "Scegli un metodo di pagamento"
    And l'ordine non viene confermato

  @id(PGMN-DATI-DI-SPDZ-ICN-090) @functional @c4-container
  Scenario: Riepilogo dell'ordine
    When sono sulla pagina del pagamento
    Then vedo il riepilogo con "Vaso Duna" a 34,00 euro, spedizione 4,90 euro e totale 38,90 euro

  @id(PGMN-EST-ORDN-PEC-010) @functional @c4-container
  Scenario: Pagamento con carta riuscito
    Given ho compilato correttamente i dati di spedizione
    And ho scelto "Carta di credito"
    When inserisco il numero di prova "4242 4242 4242 4242", scadenza "12/30" e codice CVV "123"
    And tocco "Conferma ordine"
    Then vedo "Ordine confermato" con un numero d'ordine
    And il totale pagato è 38,90 euro
    And il carrello è vuoto

  @id(PGMN-EST-ORDN-PEC-020) @functional @c4-container
  Scenario: Carta rifiutata
    Given ho compilato correttamente i dati di spedizione
    And ho scelto "Carta di credito"
    When inserisco il numero di prova "4000 0000 0000 0002", scadenza "12/30" e codice CVV "123"
    And tocco "Conferma ordine"
    Then vedo il messaggio "Pagamento rifiutato. Prova con un'altra carta."
    And l'ordine non viene confermato
    And il carrello contiene ancora 1 articolo "Vaso Duna"

  @id(PGMN-EST-ORDN-PEC-030) @functional @c4-container
  Scenario: Carta scaduta
    Given ho compilato correttamente i dati di spedizione
    And ho scelto "Carta di credito"
    When inserisco il numero di prova "4242 4242 4242 4242", scadenza "01/20" e codice CVV "123"
    And tocco "Conferma ordine"
    Then vedo il messaggio "La carta è scaduta"
    And l'ordine non viene confermato

  @id(PGMN-EST-ORDN-PEC-040) @functional @c4-container
  Scenario: Pagamento con PayPal
    Given ho compilato correttamente i dati di spedizione
    And ho scelto "PayPal"
    When tocco "Conferma ordine"
    Then vedo la schermata simulata di PayPal
    And dopo l'approvazione vedo "Ordine confermato" con un numero d'ordine

  @id(PGMN-EST-ORDN-PEC-050) @functional @c4-container
  Scenario: Pagamento con bonifico
    Given ho compilato correttamente i dati di spedizione
    And ho scelto "Bonifico bancario"
    When tocco "Conferma ordine"
    Then vedo l'IBAN di prova e la causale con il numero d'ordine
    And lo stato dell'ordine è "In attesa di pagamento"

  @id(PGMN-EST-ORDN-PEC-060) @functional @c4-container
  Scenario: I dati della carta non vengono salvati
    Given ho pagato con carta
    When riapro la pagina del pagamento
    Then i campi della carta sono vuoti

  @id(PGMN-EST-ORDN-PEC-070) @functional @c4-container @foto
  Scenario: La foto da stampare arriva al negozio
    Given nel carrello c'è una cornice con la foto "mare.jpg"
    And ho pagato con successo
    When guardo l'ordine
    Then l'ordine riporta la foto "mare.jpg" da stampare su carta fotografica
