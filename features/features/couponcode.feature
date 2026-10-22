# language: it
Funzionalità: Coupon di sconto
 Come cliente del negozio voglio inserire i dati del Coupon per ottenere uno sconto sul valore totale della spesa nel carrello

# Il coupon è simulato: nessuno sconto reale applicato su nessuna spesa reale effettuata
# Metodo di applicazione: su una spesa minima di 50,00 € , applicato coupon del valore di 10% 
# Il pulsante "Coupon per te disponibile" compare nella pagina iniziale sotto "Carrello" e "Preferiti" solo con un subtotale superiore a 50,00 €.
# Al clic il coupon "ESEMPIO10" viene copiato negli appunti e può essere incollato al pagamento.

Contesto:
Dato che nel carrello c'è un articolo 'Specchio Orbita' del valore superiore a 50,00 €

Scenario: Coupon 'ESEMPIO10' applicabile al totale della spesa nel carrello
Dato che 'Portavaso Trama' costa meno di 50,00 € 
Quando  'Portavaso Trama' è nel carrello
Allora il coupon non può essere applicato
E il valore totale della spesa resta invariato

Scenario: Mostrare il pulsante coupon per un carrello superiore a 50,00 euro
Dato che il subtotale del carrello è superiore a 50,00 €
Quando sono sulla pagina iniziale
Allora vedo "Coupon per te disponibile" sotto "Preferiti" in alto a destra
E il pulsante ha lo stesso font e la stessa dimensione di "Vai al pagamento"

Scenario: Nascondere il pulsante coupon per un carrello di 50,00 euro o meno
Dato che il subtotale del carrello è pari o inferiore a 50,00 €
Quando sono sulla pagina iniziale
Allora non vedo "Coupon per te disponibile"

Scenario: Copiare il coupon dalla pagina iniziale
Dato che il subtotale del carrello è superiore a 50,00 €
Quando tocco "Coupon per te disponibile"
Allora il codice "ESEMPIO10" viene copiato negli appunti

Scenario: Applicare il coupon al pagamento
Dato che sono sulla pagina del Pagamento
E nel carrello c'è "Lampada Lume"
Quando inserisco "ESEMPIO10" in "Inserisci qui il tuo codice sconto"
E applico il coupon
Allora vedo uno sconto pari al 10% del subtotale
E il nuovo totale viene mostrato nel riepilogo dell'ordine

Schema dello scenario: Il coupon è disponibile solo per acquisti superiori a 50,00 euro
Dato che nel carrello c'è "<articolo>"
Quando apro la pagina di pagamento
Allora il coupon "ESEMPIO10" <disponibilità> essere applicato

Esempi:
| articolo         | disponibilità |
| Lampada Lume     | può           |
| Specchio Orbita  | può           |
| Portavaso Trama  | non può       |
| Vaso Duna        | non può       |
| Candela Vaniglia | non può       |
| Cornice Atelier  | non può       |

Scenario: Acquisto di articoli superiore a 1
Dato che nel carrello ci sono più articoli
E il valore totale della spesa è superiore a 50,00 € 
Quando tocco 'Vai al pagamento' 
Allora posso inserire il coupon 'ESEMPIO10' del valore del 10%
E il valore totale della spesa si abbassa