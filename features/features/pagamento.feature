# language: it
Funzionalità: Pagamento
  Come cliente del negozio
  voglio inserire i dati di spedizione e scegliere come pagare
  per completare il mio acquisto

  # Il pagamento è simulato: nessun addebito reale e nessun dato di carta salvato
  # Metodi disponibili: carta di credito, PayPal, bonifico bancario

  Contesto:
    Dato che nel carrello c'è 1 articolo "Vaso Duna"
    E il totale è 38,90 euro

  Scenario: Andare al pagamento dal carrello
    Quando tocco "Vai al pagamento"
    Allora vedo la pagina con i dati di spedizione e la scelta del metodo di pagamento

  Scenario: Pagamento non disponibile con il carrello vuoto
    Dato che svuoto il carrello
    Quando apro il carrello
    Allora non vedo il pulsante "Vai al pagamento"

  Scenario: Metodi di pagamento disponibili
    Quando sono sulla pagina del pagamento
    Allora vedo i metodi "Carta di credito", "PayPal" e "Bonifico bancario"
    E nessun metodo è già selezionato

  Schema dello scenario: Dati di spedizione obbligatori
    Dato che sono sulla pagina del pagamento
    E compilo tutti i dati di spedizione tranne "<campo>"
    Quando tocco "Conferma ordine"
    Allora vedo il messaggio "<messaggio>"
    E l'ordine non viene confermato

    Esempi:
      | campo              | messaggio                        |
      | Nome               | Inserisci il nome                |
      | Cognome            | Inserisci il cognome             |
      | Indirizzo          | Inserisci l'indirizzo            |
      | Città              | Inserisci la città               |
      | CAP                | Inserisci il CAP                 |
      | Numero di telefono | Inserisci il numero di telefono |
      | Email              | Inserisci l'email                |

  Scenario: Inserire un numero di telefono con prefisso europeo
    Dato che sono sulla pagina del pagamento
    Quando inserisco il numero di telefono "3331234567"
    E seleziono il prefisso "+33"
    Allora il prefisso "+33" è selezionato per il numero di telefono

  Scenario: CAP non valido
    Dato che sono sulla pagina del pagamento
    Quando inserisco il CAP "123"
    Allora vedo il messaggio "Il CAP deve avere 5 cifre"

  Scenario: Email non valida
    Dato che sono sulla pagina del pagamento
    Quando inserisco l'email "maria.esempio.it"
    Allora vedo il messaggio "Inserisci un'email valida"

  Scenario: Nessun metodo di pagamento scelto
    Dato che ho compilato correttamente i dati di spedizione
    Quando tocco "Conferma ordine"
    Allora vedo il messaggio "Scegli un metodo di pagamento"
    E l'ordine non viene confermato

  Scenario: Riepilogo dell'ordine
    Quando sono sulla pagina del pagamento
    Allora vedo il riepilogo con "Vaso Duna" a 34,00 euro, spedizione 4,90 euro e totale 38,90 euro

  Scenario: Pagamento con carta riuscito
    Dato che ho compilato correttamente i dati di spedizione
    E ho scelto "Carta di credito"
    Quando inserisco il numero di prova "4242 4242 4242 4242", scadenza "12/30" e codice CVV "123"
    E tocco "Conferma ordine"
    Allora vedo "Ordine confermato" con un numero d'ordine
    E il totale pagato è 38,90 euro
    E il carrello è vuoto

  Scenario: Carta rifiutata
    Dato che ho compilato correttamente i dati di spedizione
    E ho scelto "Carta di credito"
    Quando inserisco il numero di prova "4000 0000 0000 0002", scadenza "12/30" e codice CVV "123"
    E tocco "Conferma ordine"
    Allora vedo il messaggio "Pagamento rifiutato. Prova con un'altra carta."
    E l'ordine non viene confermato
    E il carrello contiene ancora 1 articolo "Vaso Duna"

  Scenario: Carta scaduta
    Dato che ho compilato correttamente i dati di spedizione
    E ho scelto "Carta di credito"
    Quando inserisco il numero di prova "4242 4242 4242 4242", scadenza "01/20" e codice CVV "123"
    E tocco "Conferma ordine"
    Allora vedo il messaggio "La carta è scaduta"
    E l'ordine non viene confermato

  Scenario: Pagamento con PayPal
    Dato che ho compilato correttamente i dati di spedizione
    E ho scelto "PayPal"
    Quando tocco "Conferma ordine"
    Allora vedo la schermata simulata di PayPal
    E dopo l'approvazione vedo "Ordine confermato" con un numero d'ordine

  Scenario: Pagamento con bonifico
    Dato che ho compilato correttamente i dati di spedizione
    E ho scelto "Bonifico bancario"
    Quando tocco "Conferma ordine"
    Allora vedo l'IBAN di prova e la causale con il numero d'ordine
    E lo stato dell'ordine è "In attesa di pagamento"

  Scenario: I dati della carta non vengono salvati
    Dato che ho pagato con carta
    Quando riapro la pagina del pagamento
    Allora i campi della carta sono vuoti

  @foto
  Scenario: La foto da stampare arriva al negozio
    Dato che nel carrello c'è una cornice con la foto "mare.jpg"
    E ho pagato con successo
    Quando guardo l'ordine
    Allora l'ordine riporta la foto "mare.jpg" da stampare su carta fotografica