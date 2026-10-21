# language: it
Funzionalità: Personalizzazione della cornice
  Come cliente del negozio
  voglio scegliere misura, finitura, profilo e passe-partout della mia cornice
  per vedere il risultato e il prezzo prima di acquistare

  Scenario: Aprire il configuratore dalla pagina Scopri
    Dato che sono sulla pagina Scopri
    Quando tocco "Crea la tua cornice"
    Allora vedo la pagina "Crea la tua cornice" con l'anteprima

  Scenario: Selezione iniziale
    Quando apro il configuratore
    Allora risultano scelti misura 13x18, finitura "Noce", profilo "Classico" e passe-partout "Bianco"
    E il prezzo è 38,90 euro

  Schema dello scenario: Cambiare la misura
    Dato che sto configurando una cornice con finitura "Noce", profilo "Classico" e passe-partout "Bianco"
    Quando scelgo la misura <misura>
    Allora il prezzo è <prezzo> euro

    Esempi:
      | misura | prezzo |
      | 10x15  | 34,90  |
      | 13x18  | 38,90  |
      | 15x20  | 43,90  |
      | 30x30  | 58,90  |
      | 50x70  | 98,90  |

  Schema dello scenario: Cambiare la finitura
    Dato che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    Quando scelgo la finitura "<finitura>"
    Allora il prezzo è <prezzo> euro
    E l'anteprima mostra la cornice con finitura "<finitura>"

    Esempi:
      | finitura       | prezzo |
      | Noce           | 38,90  |
      | Oro spazzolato | 42,90  |

  Schema dello scenario: Cambiare il profilo
    Dato che sto configurando una cornice 13x18 con finitura "Noce" e passe-partout "Bianco"
    Quando scelgo il profilo "<profilo>"
    Allora il prezzo è <prezzo> euro
    E l'anteprima mostra la cornice con profilo "<profilo>"

    Esempi:
      | profilo       | prezzo |
      | Classico      | 38,90  |
      | Contemporaneo | 40,90  |

  Schema dello scenario: Cambiare il passe-partout
    Dato che sto configurando una cornice 13x18 con finitura "Noce" e profilo "Classico"
    Quando scelgo il passe-partout "<passepartout>"
    Allora il prezzo è <prezzo> euro
    E l'anteprima mostra il passe-partout "<passepartout>"

    Esempi:
      | passepartout   | prezzo |
      | Nessuno        | 33,00  |
      | Bianco         | 38,90  |
      | Verde smeraldo | 38,90  |
      | Rosso carminio | 38,90  |

  Scenario: Combinare più scelte
    Quando scelgo la misura 50x70, la finitura "Oro spazzolato", il profilo "Contemporaneo" e il passe-partout "Rosso carminio"
    Allora il riepilogo indica "50x70 cm, Oro spazzolato, Contemporaneo, passe-partout Rosso carminio"
    E il prezzo è 104,90 euro
    
