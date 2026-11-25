@c4-id:7179f7b5-6801-975d-df2b-d72171a79702
Feature: Pagamento: esito dell'ordine per metodo

  As a cliente del negozio
  I want pagare con carta, PayPal o bonifico e vedere l'esito dell'ordine
  So that completare il mio acquisto

  @id(PGMN-EST-ORDN-PEC-010) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Pagamento con carta riuscito
    Given che nel carrello c'è 1 articolo "Vaso Duna" e il totale è 38,90 euro
    And ho compilato correttamente i dati di spedizione
    And ho scelto "Carta di credito"
    When inserisco il numero di prova "4242 4242 4242 4242", scadenza "12/30" e codice CVV "123" e tocco "Conferma ordine"
    Then vedo "Ordine confermato" con un numero d'ordine
    And il totale pagato è 38,90 euro
    And il carrello è vuoto

  @id(PGMN-EST-ORDN-PEC-020) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Carta rifiutata
    Given che nel carrello c'è 1 articolo "Vaso Duna" e il totale è 38,90 euro
    And ho compilato correttamente i dati di spedizione
    And ho scelto "Carta di credito"
    When inserisco il numero di prova "4000 0000 0000 0002", scadenza "12/30" e codice CVV "123" e tocco "Conferma ordine"
    Then vedo il messaggio "Pagamento rifiutato. Prova con un'altra carta."
    And l'ordine non viene confermato
    And il carrello contiene ancora 1 articolo "Vaso Duna"

  @id(PGMN-EST-ORDN-PEC-030) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Carta scaduta
    Given che nel carrello c'è 1 articolo "Vaso Duna" e il totale è 38,90 euro
    And ho compilato correttamente i dati di spedizione
    And ho scelto "Carta di credito"
    When inserisco il numero di prova "4242 4242 4242 4242", scadenza "01/20" e codice CVV "123" e tocco "Conferma ordine"
    Then vedo il messaggio "La carta è scaduta"
    And l'ordine non viene confermato

  @id(PGMN-EST-ORDN-PEC-040) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Pagamento con PayPal
    Given che ho compilato correttamente i dati di spedizione
    And ho scelto "PayPal"
    When tocco "Conferma ordine"
    Then vedo la schermata simulata di PayPal
    And dopo l'approvazione vedo "Ordine confermato" con un numero d'ordine

  @id(PGMN-EST-ORDN-PEC-050) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: Pagamento con bonifico
    Given che ho compilato correttamente i dati di spedizione
    And ho scelto "Bonifico bancario"
    When tocco "Conferma ordine"
    Then vedo l'IBAN di prova e la causale con il numero d'ordine
    And lo stato dell'ordine è "In attesa di pagamento"

  @id(PGMN-EST-ORDN-PEC-060) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: I dati della carta non vengono salvati
    Given che ho pagato con carta
    When riapro la pagina del pagamento
    Then i campi della carta sono vuoti

  @id(PGMN-EST-ORDN-PEC-070) @functional @c4-component @wiki(entity-bd43ab9c-56da-6742-9ed3-b1f2db1b2019)
  Scenario: La foto da stampare arriva al negozio
    Given che nel carrello c'è una cornice con la foto "mare.jpg"
    And ho pagato con successo
    When guardo l'ordine
    Then l'ordine riporta la foto "mare.jpg" da stampare su carta fotografica
