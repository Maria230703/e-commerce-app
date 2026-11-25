@c4-id:9747bdcb-e28a-69c9-6085-5b91896d7437
Feature: Preferiti

  As a cliente del negozio
  I want salvare gli articoli che mi piacciono
  So that ritrovarli facilmente più tardi

  @id(PRFR-BSO-010) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: Aggiungere un articolo ai preferiti dal catalogo
    Given che sono sulla pagina Scopri e non ho preferiti
    When tocco il cuore di "Vaso Duna"
    Then il cuore di "Vaso Duna" risulta attivo
    And il cuore è nero pece senza spunta

  @id(PRFR-BSO-020) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: Aggiungere un articolo ai preferiti dalla scheda
    Given che sto guardando la scheda di "Lampada Lume"
    When tocco il cuore
    Then il cuore risulta attivo
    And il cuore è nero pece senza spunta
    And "Lampada Lume" compare nella pagina Preferiti

  @id(PRFR-BSO-030) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: Togliere un articolo dai preferiti
    Given che "Vaso Duna" è tra i preferiti
    When tocco di nuovo il cuore di "Vaso Duna"
    Then il cuore di "Vaso Duna" non è più attivo
    And "Vaso Duna" non compare nella pagina Preferiti

  @id(PRFR-BSO-040) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: Vedere l'elenco dei preferiti
    Given che ho tra i preferiti "Vaso Duna" e "Cornice Atelier"
    When apro la pagina Preferiti
    Then vedo 2 articoli
    And vedo "Vaso Duna" a 34 euro e "Cornice Atelier" a 29 euro
    And ogni articolo mostra la propria immagine accanto al nome

  @id(PRFR-BSO-050) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: Aprire un articolo dai preferiti
    Given che "Vaso Duna" è tra i preferiti
    When tocco l'articolo "Vaso Duna" nella pagina Preferiti
    Then vedo la scheda di "Vaso Duna"

  @id(PRFR-BSO-060) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: Tornare ai preferiti dalla scheda di un articolo
    Given che ho aperto la scheda di "Vaso Duna" dalla pagina Preferiti
    When torno indietro
    Then torno alla pagina Preferiti

  @id(PRFR-BSO-070) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: Nessun preferito
    Given che non ho preferiti
    When apro la pagina Preferiti
    Then vedo il messaggio "Tocca il cuore sugli oggetti che ti piacciono: li ritrovi tutti qui."

  @id(PRFR-BSO-080) @functional @c4-component @wiki(entity-7d40d91f-0bed-f5f3-4479-83b4d838c2ee)
  Scenario: I preferiti restano dopo aver ricaricato la pagina
    Given che ho tra i preferiti "Vaso Duna"
    When ricarico la pagina
    Then il cuore di "Vaso Duna" è ancora attivo
