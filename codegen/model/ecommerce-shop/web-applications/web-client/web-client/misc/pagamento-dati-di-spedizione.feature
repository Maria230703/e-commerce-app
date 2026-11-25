@c4-id:7179f7b5-6801-975d-df2b-d72171a79702
Feature: Pagamento: dati di spedizione e metodi

  As a cliente del negozio
  I want inserire i dati di spedizione e scegliere come pagare
  So that completare il mio acquisto

  @id(PGMN-DATI-DI-SPDZ-ICN-010) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Andare al pagamento dal carrello
    Given che nel carrello c'è 1 articolo "Vaso Duna" e il totale è 38,90 euro
    When tocco "Vai al pagamento"
    Then vedo la pagina con i dati di spedizione e la scelta del metodo di pagamento

  @id(PGMN-DATI-DI-SPDZ-ICN-020) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Pagamento non disponibile con il carrello vuoto
    Given che ho svuotato il carrello
    When apro il carrello
    Then non vedo il pulsante "Vai al pagamento"

  @id(PGMN-DATI-DI-SPDZ-ICN-030) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Metodi di pagamento disponibili
    Given che nel carrello c'è 1 articolo "Vaso Duna" e il totale è 38,90 euro
    When apro la pagina del pagamento
    Then vedo i metodi "Carta di credito", "PayPal" e "Bonifico bancario"
    And nessun metodo è già selezionato

  @id(PGMN-DATI-DI-SPDZ-ICN-040) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario Outline: Dati di spedizione obbligatori
    Given che sono sulla pagina del pagamento
    And compilo tutti i dati di spedizione tranne "<campo>"
    When tocco "Conferma ordine"
    Then vedo il messaggio "<messaggio>"
    And l'ordine non viene confermato
    Examples:
    | campo | messaggio |
    | Nome | Inserisci il nome |
    | Cognome | Inserisci il cognome |
    | Indirizzo | Inserisci l'indirizzo |
    | Città | Inserisci la città |
    | CAP | Inserisci il CAP |
    | Numero di telefono | Inserisci il numero di telefono |
    | Email | Inserisci l'email |

  @id(PGMN-DATI-DI-SPDZ-ICN-050) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Inserire un numero di telefono con prefisso europeo
    Given che sono sulla pagina del pagamento
    When inserisco il numero di telefono "3331234567" e seleziono il prefisso "+33"
    Then il prefisso "+33" è selezionato per il numero di telefono

  @id(PGMN-DATI-DI-SPDZ-ICN-060) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: CAP non valido
    Given che sono sulla pagina del pagamento
    When inserisco il CAP "123"
    Then vedo il messaggio "Il CAP deve avere 5 cifre"

  @id(PGMN-DATI-DI-SPDZ-ICN-070) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Email non valida
    Given che sono sulla pagina del pagamento
    When inserisco l'email "maria.esempio.it"
    Then vedo il messaggio "Inserisci un'email valida"

  @id(PGMN-DATI-DI-SPDZ-ICN-080) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Nessun metodo di pagamento scelto
    Given che ho compilato correttamente i dati di spedizione
    When tocco "Conferma ordine"
    Then vedo il messaggio "Scegli un metodo di pagamento"
    And l'ordine non viene confermato

  @id(PGMN-DATI-DI-SPDZ-ICN-090) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Riepilogo dell'ordine
    Given che nel carrello c'è 1 articolo "Vaso Duna" e il totale è 38,90 euro
    When sono sulla pagina del pagamento
    Then vedo il riepilogo con "Vaso Duna" a 34,00 euro, spedizione 4,90 euro e totale 38,90 euro
