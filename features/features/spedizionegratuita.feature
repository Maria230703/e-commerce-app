# language: it
Funzionalità: Spedizione gratuita
Come cliente del negozio voglio usufruire della spedizione gratuita prevista per ordini a partire  da 79 euro per risparmiare sull'ordine totale
 # Spedizione 4,90 euro, gratuita da 79,00 euro di subtotale
 
 Contesto:
 Dato che tocco 'Vai al pagamento' e voglio acquistare dal negozio

 Dato che il carrello è vuoto

Scenario: Spedizione gratuita da 79,00 euro
Dato che nel carrello c'è 'Specchio Orbita' a 119,00 euro
Quando tocco 'Vai al pagamento'
Allora la spedizione costa 0,00 euro
E il totale è di 119,00

Scenario: Spedizione a pagamento a 4,90 euro
Dato che nel carrello c'è 'Vaso Duna' a 34,00 euro 
Quando tocco 'Vai al pagamento'
Allora la spedizione costa 4,90 euro
E il totale è di 38,90 euro