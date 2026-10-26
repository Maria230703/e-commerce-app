# language: it
Funzionalità: Personalizzazione della cornice
  Come cliente del negozio
  voglio scegliere misura, profilo e passe-partout della mia cornice
  per vedere il risultato e il prezzo prima di acquistare

  Scenario: Aprire il configuratore dalla pagina Scopri
    Dato che sono sulla pagina Scopri
    Quando tocco "Crea la tua cornice"
    Allora vedo la pagina "Crea la tua cornice" con l'anteprima
    E vedo il pulsante "Indietro"

  Scenario: Il collegamento alla cornice appare una volta sotto Scopri
    Quando apro la pagina Scopri
    Allora vedo una sola volta "Crea la tua cornice"
    E il collegamento appare sotto il titolo "Scopri"

  Scenario: Selezione iniziale
    Quando apro il configuratore
    Allora risultano scelti misura 13x18, profilo "Classico" e passe-partout "Bianco"
    E la cornice ha l'aspetto Noce standard senza una scelta di finitura
    E il prezzo è 30,90 euro

  Schema dello scenario: Cambiare la misura
    Dato che sto configurando una cornice con profilo "Classico" e passe-partout "Bianco"
    Quando scelgo la misura <misura>
    Allora il prezzo è <prezzo> euro

    Esempi:
      | misura | prezzo |
      | 10x15  | 26,90  |
      | 13x18  | 30,90  |
      | 15x20  | 35,90  |
      | 30x30  | 50,90  |
      | 50x70  | 90,90  |

  Schema dello scenario: Cambiare il profilo
    Dato che sto configurando una cornice 13x18 con passe-partout "Bianco"
    Quando scelgo il profilo "<profilo>"
    Allora il prezzo è <prezzo> euro
    E l'anteprima mostra la cornice con profilo "<profilo>"

    Esempi:
      | profilo       | prezzo |
      | Classico      | 30,90  |
      | Contemporaneo | 32,90  |

  Schema dello scenario: Cambiare il passe-partout
    Dato che sto configurando una cornice 13x18 con profilo "Classico"
    Quando scelgo il passe-partout "<passepartout>"
    Allora il prezzo è <prezzo> euro
    E l'anteprima mostra il passe-partout "<passepartout>"

    Esempi:
      | passepartout   | prezzo |
      | Nessuno        | 25,00  |
      | Bianco         | 30,90  |
      | Verde smeraldo | 30,90  |
      | Rosso carminio | 30,90  |

  Scenario: Combinare più scelte
    Quando scelgo la misura 50x70, il profilo "Contemporaneo" e il passe-partout "Rosso carminio"
    Allora il riepilogo indica "50x70 cm, Contemporaneo, passe-partout Rosso carminio"
    E il prezzo è 92,90 euro
    
