@c4-id:6a3feb6a-aab2-b194-12ce-55e1586f95be
Feature: Catalogo prodotti

  As a cliente del negozio
  I want vedere gli articoli e filtrarli
  So that categoria per trovare più in fretta ciò che mi interessa

  @id(CTLG-PRDT-GSE-010) @functional @c4-container @wiki(entity-6a3feb6a-aab2-b194-12ce-55e1586f95be)
  Scenario: Vedere tutti gli articoli
    Given il negozio ha 6 articoli
    When apro la pagina Scopri
    Then vedo 6 articoli

  @id(CTLG-PRDT-GSE-020) @functional @c4-container @wiki(entity-6a3feb6a-aab2-b194-12ce-55e1586f95be)
  Scenario: Filtrare per categoria
    Given il negozio ha 1 cornice su 6 articoli
    When scelgo la categoria "Cornici"
    Then vedo 1 articolo
