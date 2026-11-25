@c4-id:9a58fe02-2101-9446-7d8d-c994a3c67b42
Feature: Stampa della propria foto

  As a cliente del negozio
  I want caricare la mia foto e riceverla stampata nella cornice
  So that avere un ricordo mio senza costi di stampa

  @id(STMP-DLL-PRPR-FOTO-JUL-010) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: Anteprima prima del caricamento
    Given che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When guardo l'anteprima senza aver caricato una foto
    Then l'anteprima mostra il segnaposto "La tua foto"
    And vedo il pulsante "Carica la tua foto"
    And vedo la frase "Stampa su carta fotografica inclusa nel prezzo"

  @id(STMP-DLL-PRPR-FOTO-JUL-020) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario Outline: Caricare una foto valida
    Given che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When carico il file "<file>"
    Then l'anteprima mostra la mia foto dentro la cornice
    And il segnaposto "La tua foto" non è più visibile
    And vedo il nome del file "<file>"
    Examples:
    | file |
    | mare.jpg |
    | mare.png |
    | mare.webp |

  @id(STMP-DLL-PRPR-FOTO-JUL-030) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: File di formato non accettato
    Given che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When carico il file "documento.pdf"
    Then vedo il messaggio "Formato non supportato. Carica un'immagine JPG, PNG o WebP."
    And l'anteprima mostra ancora il segnaposto "La tua foto"

  @id(STMP-DLL-PRPR-FOTO-JUL-040) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: Foto troppo pesante
    Given che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When carico il file "panorama.jpg" da 12 MB
    Then vedo il messaggio "La foto supera i 10 MB. Scegline una più leggera."
    And l'anteprima mostra ancora il segnaposto "La tua foto"

  @id(STMP-DLL-PRPR-FOTO-JUL-050) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: La stampa è un omaggio e non cambia il prezzo
    Given che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When carico il file "mare.jpg"
    Then il riepilogo mostra "Stampa foto su carta fotografica: omaggio"
    And il prezzo è 30,90 euro

  @id(STMP-DLL-PRPR-FOTO-JUL-060) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: La carta fotografica è l'unico tipo di stampa
    Given che ho caricato il file "mare.jpg"
    When guardo il tipo di stampa
    Then vedo "Carta fotografica" come tipo di stampa
    And non vedo nessuna scelta del tipo di carta

  @id(STMP-DLL-PRPR-FOTO-JUL-070) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: Senza foto non c'è la stampa
    Given che sto configurando una cornice 13x18 con profilo "Classico" e passe-partout "Bianco"
    When guardo il riepilogo senza aver caricato una foto
    Then il riepilogo non mostra la voce di stampa

  @id(STMP-DLL-PRPR-FOTO-JUL-080) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: La foto resta cambiando le scelte
    Given che ho caricato il file "mare.jpg"
    When scelgo il profilo "Contemporaneo" e il passe-partout "Rosso carminio"
    Then l'anteprima mostra ancora la mia foto, con il nuovo profilo e il nuovo passe-partout
    And il prezzo è 32,90 euro

  @id(STMP-DLL-PRPR-FOTO-JUL-090) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: Sostituire la foto
    Given che ho caricato il file "mare.jpg"
    When carico il file "montagna.jpg"
    Then l'anteprima mostra la nuova foto
    And vedo il nome del file "montagna.jpg"

  @id(STMP-DLL-PRPR-FOTO-JUL-100) @functional @c4-component @wiki(entity-dc487e23-0a3f-05ad-a17e-92db88a7daab)
  Scenario: Togliere la foto
    Given che ho caricato il file "mare.jpg"
    When tocco "Rimuovi foto"
    Then l'anteprima mostra di nuovo il segnaposto "La tua foto"
    And il riepilogo non mostra la voce di stampa
