@c4-id:9d114334-0c4d-443b-5fb6-bb2f27f4b365
Feature: Spedizione: costo e soglia gratuita

  As a cliente del negozio
  I want usufruire della spedizione gratuita prevista per ordini a partire da 79 euro
  So that risparmiare sull'ordine totale

  @id(SPDZ-STP-010) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario Outline: Costo della spedizione
    Given che il subtotale del carrello è <subtotale> euro
    When guardo il riepilogo del carrello
    Then la spedizione costa <spedizione> euro
    And il totale è <totale> euro
    Examples:
    | subtotale | spedizione | totale |
    | 34,00 | 4,90 | 38,90 |
    | 78,90 | 4,90 | 83,80 |
    | 79,00 | 0,00 | 79,00 |
    | 123,00 | 0,00 | 123,00 |

  @id(SPDZ-STP-020) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Barra della spedizione gratuita
    Given che nel carrello c'è 1 articolo "Vaso Duna"
    When guardo il riepilogo del carrello
    Then vedo "Ti mancano 45,00 euro per la spedizione gratuita"

  @id(SPDZ-STP-030) @functional @c4-component @wiki(entity-32be3296-6b21-5964-8815-ef0bf817c0ab)
  Scenario: Spedizione gratuita raggiunta
    Given che nel carrello c'è 1 articolo "Lampada Lume"
    When guardo il riepilogo del carrello
    Then vedo "Spedizione gratuita sbloccata"

  @id(SPDZ-STP-040) @functional @c4-component @wiki(entity-94d6dcb5-3ead-b352-1700-b2185272c021)
  Scenario: Spedizione gratuita da 79,00 euro al pagamento
    Given che nel carrello c'è 'Specchio Orbita' a 119,00 euro
    When tocco 'Vai al pagamento'
    Then la spedizione costa 0,00 euro
    And il totale è di 119,00 euro

  @id(SPDZ-STP-050) @functional @c4-component @wiki(entity-94d6dcb5-3ead-b352-1700-b2185272c021)
  Scenario: Spedizione a pagamento a 4,90 euro al pagamento
    Given che nel carrello c'è 'Vaso Duna' a 34,00 euro
    When tocco 'Vai al pagamento'
    Then la spedizione costa 4,90 euro
    And il totale è di 38,90 euro
