# language: it
Funzionalità: Carrello
  Come cliente del negozio
  voglio raccogliere gli articoli che voglio comprare e vedere il totale
  per decidere cosa acquistare

  # Spedizione 4,90 euro, gratuita da 79,00 euro di subtotale

  Scenario: Carrello vuoto
    Dato che non ho aggiunto nulla
    Quando apro il carrello
    Allora vedo il messaggio "Il carrello è vuoto"
    E non vedo il pulsante "Vai al pagamento"

  Scenario: Il riepilogo non appare nella pagina Scopri
    Dato che sono sulla pagina Scopri
    Quando non ho ancora toccato il pulsante Carrello
    Allora non vedo il riepilogo del carrello
    E il pulsante Carrello resta visibile nell'intestazione

  Scenario: Aprire il carrello dal pulsante
    Dato che sono sulla pagina Scopri
    Quando tocco il pulsante Carrello
    Allora si apre la pagina del carrello
    E posso vedere il riepilogo e il totale

  Scenario: Aggiungere un articolo dalla scheda
    Dato che il carrello è vuoto
    E sto guardando la scheda di "Vaso Duna"
    Quando tocco "Aggiungi"
    Allora il carrello contiene 1 articolo "Vaso Duna" a 34,00 euro
    E l'icona del carrello mostra 1

  Scenario: Aggiungere due volte lo stesso articolo
    Dato che nel carrello c'è 1 articolo "Vaso Duna"
    Quando aggiungo di nuovo "Vaso Duna" dalla sua scheda
    Allora il carrello ha una sola riga "Vaso Duna" con quantità 2
    E l'icona del carrello mostra 2

  Scenario: Aumentare la quantità
    Dato che nel carrello c'è 1 articolo "Vaso Duna"
    Quando aumento la quantità di "Vaso Duna" a 3
    Allora la riga "Vaso Duna" mostra 102,00 euro

  Scenario: Togliere un articolo diminuendo la quantità
    Dato che nel carrello c'è 1 articolo "Vaso Duna"
    Quando diminuisco la quantità di "Vaso Duna"
    Allora "Vaso Duna" non è più nel carrello
    E vedo il messaggio "Il carrello è vuoto"

  Scenario: Aggiungere una cornice personalizzata
    Dato che il carrello è vuoto
    E sto configurando una cornice 13x18 con finitura "Noce", profilo "Classico" e passe-partout "Bianco"
    Quando tocco "Aggiungi al carrello"
    Allora il carrello contiene "Cornice su misura" a 38,90 euro
    E la riga riporta "13x18 cm, Noce, Classico, passe-partout Bianco"

  Scenario: Cornice personalizzata con foto
    Dato che sto configurando una cornice 13x18 con finitura "Noce", profilo "Classico" e passe-partout "Bianco"
    E ho caricato il file "mare.jpg"
    Quando tocco "Aggiungi al carrello"
    Allora la riga della cornice riporta "Stampa foto su carta fotografica: omaggio"
    E il prezzo della riga è 38,90 euro

  Scenario: Cornici con scelte diverse sono righe separate
    Dato che nel carrello c'è una cornice 13x18 "Noce", "Classico", passe-partout "Bianco"
    Quando aggiungo una cornice 13x18 "Oro spazzolato", "Classico", passe-partout "Bianco"
    Allora il carrello ha due righe di cornice
    E il subtotale è 81,80 euro

  Schema dello scenario: Costo della spedizione
    Dato che il subtotale del carrello è <subtotale> euro
    Quando guardo il riepilogo del carrello
    Allora la spedizione costa <spedizione> euro
    E il totale è <totale> euro

    Esempi:
      | subtotale | spedizione | totale |
      | 34,00     | 4,90       | 38,90  |
      | 78,90     | 4,90       | 83,80  |
      | 79,00     | 0,00       | 79,00  |
      | 123,00    | 0,00       | 123,00 |

  Scenario: Barra della spedizione gratuita
    Dato che nel carrello c'è 1 articolo "Vaso Duna"
    Quando guardo il riepilogo del carrello
    Allora vedo "Ti mancano 45,00 euro per la spedizione gratuita"

  Scenario: Spedizione gratuita raggiunta
    Dato che nel carrello c'è 1 articolo "Lampada Lume"
    Quando guardo il riepilogo del carrello
    Allora vedo "Spedizione gratuita sbloccata"

  Scenario: Il carrello resta dopo la ricarica
    Dato che nel carrello c'è 1 articolo "Vaso Duna"
    Quando ricarico la pagina
    Allora il carrello contiene ancora 1 articolo "Vaso Duna"
  Scenario: Il pulsante mantiene la posizione e rimuove l'articolo al secondo tocco
    Dato che sono sulla pagina Scopri e il carrello è vuoto
    Quando tocco "Aggiungi" su "Lampada Lume"
    Allora il pulsante di "Lampada Lume" diventa verde e mostra "Aggiunto"
    E il pulsante resta nella stessa posizione
    E gli altri articoli mantengono il pulsante "Aggiungi"
    E tocco di nuovo il pulsante di "Lampada Lume"
    Allora "Lampada Lume" non è più nel carrello
    E il pulsante di "Lampada Lume" torna "Aggiungi"

  Scenario: Il pulsante torna normale se l'articolo esce dal carrello
    Dato che "Lampada Lume" è nel carrello
    Quando tolgo "Lampada Lume" dal carrello
    Allora il pulsante di "Lampada Lume" torna "Aggiungi"