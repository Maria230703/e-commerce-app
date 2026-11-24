@c4-id:d4ed3df2-88bc-7f7e-6fdd-a185fc8ff39b
Feature: Personalizzazione della cornice

  As a cliente del negozio
  I want scegliere misura, profilo e passe-partout della mia cornice
  So that vedere il risultato e il prezzo prima di acquistare

  @id(PRSN-CRNC-TMM-010) @functional @c4-container
  Scenario: Aprire il configuratore dalla pagina Scopri
    Given sono sulla pagina Scopri
    When tocco "Crea la tua cornice"
    Then vedo la pagina "Crea la tua cornice" con l'anteprima
    And vedo il pulsante "Indietro"

  @id(PRSN-CRNC-TMM-020) @functional @c4-container
  Scenario: Il collegamento alla cornice appare una volta sotto Scopri
    Given il negozio ha 6 articoli
    When apro la pagina Scopri
    Then vedo una sola volta "Crea la tua cornice"
    And il collegamento appare sotto il titolo "Scopri"

  @id(PRSN-CRNC-TMM-030) @functional @c4-container
  Scenario: Selezione iniziale
    Given non ho ancora fatto nessuna scelta
    When apro il configuratore
    Then risultano scelti misura 13x18, profilo "Classico" e passe-partout "Bianco"
    And la cornice ha l'aspetto Noce standard senza una scelta di finitura
    And il prezzo è 30,90 euro

  @id(PRSN-CRNC-TMM-040) @functional @c4-container
  Scenario Outline: Cambiare la misura
    Given sto configurando una cornice con profilo "Classico" e passe-partout "Bianco"
    When scelgo la misura <misura>
    Then il prezzo è <prezzo> euro
    Examples:
    | misura | prezzo |
    | 10x15  | 26,90  |
    | 13x18  | 30,90  |
    | 15x20  | 35,90  |
    | 30x30  | 50,90  |
    | 50x70  | 90,90  |

  @id(PRSN-CRNC-TMM-050) @functional @c4-container
  Scenario Outline: Cambiare il profilo
    Given sto configurando una cornice 13x18 con passe-partout "Bianco"
    When scelgo il profilo "<profilo>"
    Then il prezzo è <prezzo> euro
    And l'anteprima mostra la cornice con profilo "<profilo>"
    Examples:
    | profilo       | prezzo |
    | Classico      | 30,90  |
    | Contemporaneo | 32,90  |

  @id(PRSN-CRNC-TMM-060) @functional @c4-container
  Scenario Outline: Cambiare il passe-partout
    Given sto configurando una cornice 13x18 con profilo "Classico"
    When scelgo il passe-partout "<passepartout>"
    Then il prezzo è <prezzo> euro
    And l'anteprima mostra il passe-partout "<passepartout>"
    Examples:
    | passepartout   | prezzo |
    | Nessuno        | 25,00  |
    | Bianco         | 30,90  |
    | Verde smeraldo | 30,90  |
    | Rosso carminio | 30,90  |

  @id(PRSN-CRNC-TMM-070) @functional @c4-container
  Scenario: Combinare più scelte
    Given sono nel configuratore della cornice
    When scelgo la misura 50x70, il profilo "Contemporaneo" e il passe-partout "Rosso carminio"
    Then il riepilogo indica "50x70 cm, Contemporaneo, passe-partout Rosso carminio"
    And il prezzo è 92,90 euro
