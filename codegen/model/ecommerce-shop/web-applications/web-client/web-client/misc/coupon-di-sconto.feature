@c4-id:9d114334-0c4d-443b-5fb6-bb2f27f4b365
Feature: Coupon di sconto

  As a cliente del negozio
  I want inserire i dati del coupon per ottenere uno sconto sul valore totale della spesa nel carrello
  So that pagare meno per una spesa superiore a 50,00 euro

  @id(CPN-DI-SCNT-QAD-010) @functional @c4-component @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Coupon non applicabile a un carrello sotto i 50,00 euro
    Given che 'Portavaso Trama' costa meno di 50,00 euro
    When 'Portavaso Trama' è nel carrello
    Then il coupon non può essere applicato
    And il valore totale della spesa resta invariato

  @id(CPN-DI-SCNT-QAD-020) @functional @c4-component @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Mostrare il messaggio del coupon nella barra superiore
    Given sono sulla pagina iniziale
    When guardo la barra superiore
    Then vedo al centro il messaggio "Primo acquisto: -10% con" seguito dal codice del coupon
    And il messaggio c'è con qualunque subtotale del carrello, al posto del pulsante "Coupon per te disponibile"

  @id(CPN-DI-SCNT-QAD-030) @functional @c4-component @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Il codice nella barra è lo stesso del campo coupon nel carrello
    Given il sito conosce un solo codice coupon
    When guardo il codice nella barra superiore
    Then è lo stesso codice che il campo "Inserisci qui il tuo codice sconto" accetta al pagamento

  @id(CPN-DI-SCNT-QAD-040) @functional @c4-component @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Copiare il codice dalla barra superiore
    Given sono sulla pagina iniziale
    When tocco il codice nella barra superiore
    Then il codice viene copiato negli appunti
    And la finestra sotto il codice mostra una spunta e "Copiato"
    And un annuncio per chi non vede dice "Codice copiato"

  @id(CPN-DI-SCNT-QAD-050) @functional @c4-component @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Applicare il coupon al pagamento
    Given che sono sulla pagina del Pagamento
    And nel carrello c'è "Lampada Lume"
    When inserisco "FirstPurchase" in "Inserisci qui il tuo codice sconto" e applico il coupon
    Then vedo uno sconto pari al 10% del subtotale
    And il nuovo totale viene mostrato nel riepilogo dell'ordine

  @id(CPN-DI-SCNT-QAD-060) @functional @c4-component @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario Outline: Il coupon è disponibile solo per acquisti superiori a 50,00 euro
    Given che nel carrello c'è "<articolo>"
    When apro la pagina di pagamento
    Then il coupon "FirstPurchase" <disponibilità> essere applicato
    Examples:
    | articolo | disponibilità |
    | Lampada Lume | può |
    | Specchio Orbita | può |
    | Portavaso Trama | non può |
    | Vaso Duna | non può |
    | Candela Vaniglia | non può |
    | Cornice Atelier | non può |

  @id(CPN-DI-SCNT-QAD-070) @functional @c4-component @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Acquisto di più articoli oltre 50,00 euro
    Given che nel carrello ci sono più articoli
    And il valore totale della spesa è superiore a 50,00 euro
    When tocco 'Vai al pagamento'
    Then posso inserire il coupon 'FirstPurchase' del valore del 10%
    And il valore totale della spesa si abbassa
