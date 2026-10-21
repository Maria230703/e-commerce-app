# language: it
Funzionalità: Preferiti
  Come cliente del negozio
  voglio salvare gli articoli che mi piacciono
  per ritrovarli facilmente più tardi

  Scenario: Aggiungere un articolo ai preferiti dal catalogo
    Dato che sono sulla pagina Scopri e non ho preferiti
    Quando tocco il cuore di "Vaso Duna"
    Allora il cuore di "Vaso Duna" risulta attivo

  Scenario: Aggiungere un articolo ai preferiti dalla scheda
    Dato che sto guardando la scheda di "Lampada Lume"
    Quando tocco il cuore
    Allora il cuore risulta attivo
    E "Lampada Lume" compare nella pagina Preferiti

  Scenario: Togliere un articolo dai preferiti
    Dato che "Vaso Duna" è tra i preferiti
    Quando tocco di nuovo il cuore di "Vaso Duna"
    Allora il cuore di "Vaso Duna" non è più attivo
    E "Vaso Duna" non compare nella pagina Preferiti

  Scenario: Vedere l'elenco dei preferiti
    Dato che ho tra i preferiti "Vaso Duna" e "Cornice Atelier"
    Quando apro la pagina Preferiti
    Allora vedo 2 articoli
    E vedo "Vaso Duna" a 34 euro e "Cornice Atelier" a 29 euro

  Scenario: Nessun preferito
    Dato che non ho preferiti
    Quando apro la pagina Preferiti
    Allora vedo il messaggio "Tocca il cuore sugli oggetti che ti piacciono: li ritrovi tutti qui."

  Scenario: I preferiti restano dopo aver ricaricato la pagina
    Dato che ho tra i preferiti "Vaso Duna"
    Quando ricarico la pagina
    Allora il cuore di "Vaso Duna" è ancora attivo
    