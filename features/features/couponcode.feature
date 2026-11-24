@c4-id:f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47
Feature: Coupon di sconto

  As a cliente del negozio
  I want inserire i dati del Coupon
  So that ottenere uno sconto sul valore totale della spesa nel carrello

  # Il coupon è simulato: nessuno sconto reale applicato su nessuna spesa reale effettuata
  # Metodo di applicazione: su una spesa minima di 50,00 € , applicato coupon del valore di 10%
  # Il pulsante "Coupon per te disponibile" compare nella pagina iniziale sotto "Carrello" e "Preferiti" solo con un subtotale superiore a 50,00 €.
  # Al clic il coupon "FirstPurchase" viene copiato negli appunti e può essere incollato al pagamento.
  Background:
    Given nel carrello c'è un articolo 'Specchio Orbita' del valore superiore a 50,00 €

  @id(CPN-DI-SCNT-QAD-010) @functional @c4-container
  Scenario: Coupon 'FirstPurchase' applicabile al totale della spesa nel carrello
    Given 'Portavaso Trama' costa meno di 50,00 €
    When 'Portavaso Trama' è nel carrello
    Then il coupon non può essere applicato
    And il valore totale della spesa resta invariato

  @id(CPN-DI-SCNT-QAD-020) @functional @c4-container
  Scenario: Mostrare il pulsante coupon per un carrello superiore a 50,00 euro
    Given il subtotale del carrello è superiore a 50,00 €
    When sono sulla pagina iniziale
    Then vedo "Coupon per te disponibile" sotto "Preferiti" in alto a destra
    And il pulsante ha lo stesso font e la stessa dimensione di "Vai al pagamento"

  @id(CPN-DI-SCNT-QAD-030) @functional @c4-container
  Scenario: Nascondere il pulsante coupon per un carrello di 50,00 euro o meno
    Given il subtotale del carrello è pari o inferiore a 50,00 €
    When sono sulla pagina iniziale
    Then non vedo "Coupon per te disponibile"

  @id(CPN-DI-SCNT-QAD-040) @functional @c4-container
  Scenario: Copiare il coupon dalla pagina iniziale
    Given il subtotale del carrello è superiore a 50,00 €
    When tocco "Coupon per te disponibile"
    Then il codice "FirstPurchase" viene copiato negli appunti

  @id(CPN-DI-SCNT-QAD-050) @functional @c4-container
  Scenario: Applicare il coupon al pagamento
    Given sono sulla pagina del Pagamento
    And nel carrello c'è "Lampada Lume"
    When inserisco "FirstPurchase" in "Inserisci qui il tuo codice sconto"
    And applico il coupon
    Then vedo uno sconto pari al 10% del subtotale
    And il nuovo totale viene mostrato nel riepilogo dell'ordine

  @id(CPN-DI-SCNT-QAD-060) @functional @c4-container
  Scenario Outline: Il coupon è disponibile solo per acquisti superiori a 50,00 euro
    Given nel carrello c'è "<articolo>"
    When apro la pagina di pagamento
    Then il coupon "FirstPurchase" <disponibilità> essere applicato
    Examples:
    | articolo         | disponibilità |
    | Lampada Lume     | può           |
    | Specchio Orbita  | può           |
    | Portavaso Trama  | non può       |
    | Vaso Duna        | non può       |
    | Candela Vaniglia | non può       |
    | Cornice Atelier  | non può       |

  @id(CPN-DI-SCNT-QAD-070) @functional @c4-container
  Scenario: Acquisto di articoli superiore a 1
    Given nel carrello ci sono più articoli
    And il valore totale della spesa è superiore a 50,00 €
    When tocco 'Vai al pagamento'
    Then posso inserire il coupon 'FirstPurchase' del valore del 10%
    And il valore totale della spesa si abbassa
