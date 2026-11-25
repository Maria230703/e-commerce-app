# Il coupon è simulato: nessuno sconto reale applicato su nessuna spesa reale effettuata
# Metodo di applicazione: su una spesa minima di 50,00 € , applicato coupon del valore di 10%
# Il messaggio "Primo acquisto: -10% con <codice>" sta al centro della barra superiore della pagina iniziale, sempre visibile; il codice è un pulsante che lo copia negli appunti. Il codice è quello di coupon-logic.js, lo stesso del campo coupon al pagamento.
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

  @id(CPN-DI-SCNT-QAD-010) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Coupon 'FirstPurchase' applicabile al totale della spesa nel carrello
    Given 'Portavaso Trama' costa meno di 50,00 €
    When 'Portavaso Trama' è nel carrello
    Then il coupon non può essere applicato
    And il valore totale della spesa resta invariato

  @id(CPN-DI-SCNT-QAD-020) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Mostrare il messaggio del coupon nella barra superiore
    Given sono sulla pagina iniziale
    When guardo la barra superiore
    Then vedo al centro il messaggio "Primo acquisto: -10% con" seguito dal codice del coupon
    And il messaggio c'è con qualunque subtotale del carrello, al posto del pulsante "Coupon per te disponibile"

  @id(CPN-DI-SCNT-QAD-030) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Il codice nella barra è lo stesso del campo coupon nel carrello
    Given il sito conosce un solo codice coupon
    When guardo il codice nella barra superiore
    Then è lo stesso codice che il campo "Inserisci qui il tuo codice sconto" accetta al pagamento

  @id(CPN-DI-SCNT-QAD-040) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Copiare il codice dalla barra superiore
    Given sono sulla pagina iniziale
    When tocco il codice nella barra superiore
    Then il codice viene copiato negli appunti
    And la finestra sotto il codice mostra una spunta e "Copiato"
    And un annuncio per chi non vede dice "Codice copiato"

  @id(CPN-DI-SCNT-QAD-050) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Applicare il coupon al pagamento
    Given sono sulla pagina del Pagamento
    And nel carrello c'è "Lampada Lume"
    When inserisco "FirstPurchase" in "Inserisci qui il tuo codice sconto"
    And applico il coupon
    Then vedo uno sconto pari al 10% del subtotale
    And il nuovo totale viene mostrato nel riepilogo dell'ordine

  @id(CPN-DI-SCNT-QAD-060) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
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

  @id(CPN-DI-SCNT-QAD-070) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Acquisto di articoli superiore a 1
    Given nel carrello ci sono più articoli
    And il valore totale della spesa è superiore a 50,00 €
    When tocco 'Vai al pagamento'
    Then posso inserire il coupon 'FirstPurchase' del valore del 10%
    And il valore totale della spesa si abbassa

  @id(CPNC-6SAFGZ) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Il codice è un pulsante e non c'è più "Copia codice" come pulsante
    Given sono sulla pagina iniziale
    When guardo il codice nella barra superiore
    Then il codice è un pulsante sottolineato con un tratteggio
    And non c'è nessun altro pulsante "Copia codice" nella pagina

  @id(CPNC-4RG5VF) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: La finestra "Copia codice" compare al passaggio del mouse e al focus
    Given sono sulla pagina iniziale
    When passo il mouse sul codice oppure lo raggiungo con la tastiera
    Then sotto il codice compare una finestra con la scritta "Copia codice"
    And la finestra ha sfondo scuro, testo bianco da 12 pixel e una freccia verso l'alto

  @id(CPNC-2PMRGV) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Copiare il codice con Invio, Spazio, clic o tocco
    Given il codice nella barra superiore ha il focus
    When premo Invio oppure Spazio, oppure faccio clic o tocco
    Then il codice viene copiato negli appunti, con un metodo alternativo se gli appunti non sono disponibili

  @id(CPNC-4MYF8T) @functional @c4-container @wiki(entity-f1faedaf-6a9e-0d5d-7a34-fe0d32fcbe47)
  Scenario: Copia non riuscita
    Given gli appunti rifiutano la copia e il metodo alternativo non funziona
    When tocco il codice nella barra superiore
    Then la finestra sotto il codice mostra "Copia non riuscita"
    And il codice del sito non cambia
