# language: it
Funzionalità: Coupon di sconto
 Come cliente del negozio voglio inserire i dati del Coupon per ottenere uno sconto sul valore totale della spesa nel carrello

# Il coupon è simulato: nessuno sconto reale applicato su nessuna spesa reale effettuata
# Metodo di applicazione: su una spesa minima di 50,00 € , applicato coupon del valore di 10% 
# Il pulsante "Inserisci il coupon" ha lo stesso font e la stessa dimensione di "Vai al pagamento".
# Il pulsante compare nella pagina iniziale sotto "Carrello" e "Preferiti" solo con un subtotale superiore a 50,00 €.

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
Allora vedo "Inserisci il coupon" sotto "Preferiti" in alto a destra
E il pulsante ha lo stesso font e la stessa dimensione di "Vai al pagamento"

Scenario: Nascondere il pulsante coupon per un carrello di 50,00 euro o meno
Dato che il subtotale del carrello è pari o inferiore a 50,00 €
Quando sono sulla pagina iniziale
Allora non vedo "Inserisci il coupon"

Scenario: Applicare ESEMPIO10 al carrello idoneo
Dato che il subtotale del carrello è superiore a 50,00 €
Quando tocco "Inserisci il coupon"
E inserisco "ESEMPIO10"
E applico il coupon
Allora vedo uno sconto pari al 10% del subtotale
E il totale del carrello viene aggiornato

Schema dello scenario: Dati del totale della spesa nel carrello obbligatorio
Dato che sono sulla pagina del Pagamento
E l'articolo costa più di 50,00 € 
Quando tocco 'Conferma ordine'
E il coupon 'ESEMPIO10' del valore del 10% può essere inserito
E lo sconto viene applicato
E un nuovo totale viene generato

Esempi:
| Lampada Lume      | Inserisci  coupon 'ESEMPIO10' del valore del 10%
| Specchio Orbita.   | Inserisci  coupon 'ESEMPIO10' del valore del 10%
| Portavaso Trama.  | Non inserisci  coupon 'ESEMPIO10' del valore del 10%
| Vaso Duna.               | Non inserisci  coupon 'ESEMPIO10' del valore del 10%
| Candela Vaniglia.  | Non inserisci  coupon 'ESEMPIO10' del valore del 10%
| Cornice Atelier.     | Non inserisci  coupon 'ESEMPIO10' del valore del 10%

Scenario: Acquisto di articoli superiore a 1
Dato che nel carrello ci sono più articoli
E il valore totale della spesa è superiore a 50,00 € 
Quando tocco 'Vai al pagamento' 
Allora posso inserire il coupon 'ESEMPIO10' del valore del 10%
E il valore totale della spesa si abbassa