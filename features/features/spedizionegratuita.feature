@c4-id:94d6dcb5-3ead-b352-1700-b2185272c021
Feature: Spedizione gratuita

  As a cliente del negozio
  I want usufruire della spedizione gratuita prevista per ordini a partire da 79 euro
  So that risparmiare sull'ordine totale

  # Spedizione 4,90 euro, gratuita da 79,00 euro di subtotale
  Background:
    Given tocco 'Vai al pagamento' e voglio acquistare dal negozio
    And il carrello è vuoto

  @id(SPDZ-STP-040) @functional @c4-container @wiki(entity-94d6dcb5-3ead-b352-1700-b2185272c021)
  Scenario: Spedizione gratuita da 79,00 euro
    Given nel carrello c'è 'Specchio Orbita' a 119,00 euro
    When tocco 'Vai al pagamento'
    Then la spedizione costa 0,00 euro
    And il totale è di 119,00

  @id(SPDZ-STP-050) @functional @c4-container @wiki(entity-94d6dcb5-3ead-b352-1700-b2185272c021)
  Scenario: Spedizione a pagamento a 4,90 euro
    Given nel carrello c'è 'Vaso Duna' a 34,00 euro
    When tocco 'Vai al pagamento'
    Then la spedizione costa 4,90 euro
    And il totale è di 38,90 euro
