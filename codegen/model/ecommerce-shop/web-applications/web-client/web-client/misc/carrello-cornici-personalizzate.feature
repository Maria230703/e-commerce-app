@c4-id:24c5e321-e194-8b73-99c5-cf13f4e84793
Feature: Carrello: cornici personalizzate

  As a cliente del negozio
  I want mettere nel carrello la cornice che ho configurato
  So that acquistarla con le mie scelte e la mia foto

  @id(CRRL-CRNC-PRSN-BCS-010) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Aggiungere una cornice personalizzata
    Given che il carrello è vuoto
    And sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When tocco "Aggiungi al carrello"
    Then il carrello contiene "Cornice su misura" a 30,90 euro
    And la riga riporta "13x18 cm, Classico, passe-partout Bianco"

  @id(CRRL-CRNC-PRSN-BCS-020) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Cornice personalizzata con foto
    Given che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    And ho caricato il file "mare.jpg"
    When tocco "Aggiungi al carrello"
    Then la riga della cornice riporta "Stampa foto su carta fotografica: omaggio"
    And il prezzo della riga è 30,90 euro

  @id(CRRL-CRNC-PRSN-BCS-030) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Cornici con scelte diverse sono righe separate
    Given che nel carrello c'è una cornice 13x18 "Classico", passe-partout "Bianco"
    When aggiungo una cornice 13x18 "Contemporaneo", passe-partout "Bianco"
    Then il carrello ha due righe di cornice
    And il subtotale è 63,80 euro
