# language: it
Funzionalità: Stampa della propria foto
  Come cliente del negozio
  voglio caricare la mia foto e riceverla stampata nella cornice
  per avere un ricordo mio senza costi di stampa

  # Per ora la stampa è disponibile solo su carta fotografica
  # La stampa è un servizio in omaggio: non modifica il prezzo

  Contesto:
    Dato che sto configurando una cornice 13x18 con finitura "Noce", profilo "Classico" e passe-partout "Bianco"

  Scenario: Anteprima prima del caricamento
    Allora l'anteprima mostra il segnaposto "La tua foto"
    E vedo il pulsante "Carica la tua foto"
    E vedo la frase "Stampa su carta fotografica inclusa nel prezzo"

  Schema dello scenario: Caricare una foto valida
    Quando carico il file "<file>"
    Allora l'anteprima mostra la mia foto dentro la cornice
    E il segnaposto "La tua foto" non è più visibile
    E vedo il nome del file "<file>"

    Esempi:
      | file      |
      | mare.jpg  |
      | mare.png  |
      | mare.webp |

  Scenario: File di formato non accettato
    Quando carico il file "documento.pdf"
    Allora vedo il messaggio "Formato non supportato. Carica un'immagine JPG, PNG o WebP."
    E l'anteprima mostra ancora il segnaposto "La tua foto"

  Scenario: Foto troppo pesante
    Quando carico il file "panorama.jpg" da 12 MB
    Allora vedo il messaggio "La foto supera i 10 MB. Scegline una più leggera."
    E l'anteprima mostra ancora il segnaposto "La tua foto"

  Scenario: La stampa è un omaggio e non cambia il prezzo
    Quando carico il file "mare.jpg"
    Allora il riepilogo mostra "Stampa foto su carta fotografica: omaggio"
    E il prezzo è 38,90 euro

  Scenario: La carta fotografica è l'unico tipo di stampa
    Dato che ho caricato il file "mare.jpg"
    Allora vedo "Carta fotografica" come tipo di stampa
    E non vedo nessuna scelta del tipo di carta

  Scenario: Senza foto non c'è la stampa
    Allora il riepilogo non mostra la voce di stampa

  Scenario: La foto resta cambiando le scelte
    Dato che ho caricato il file "mare.jpg"
    Quando scelgo il profilo "Contemporaneo" e il passe-partout "Rosso carminio"
    Allora l'anteprima mostra ancora la mia foto, con il nuovo profilo e il nuovo passe-partout
    E il prezzo è 40,90 euro

  Scenario: Sostituire la foto
    Dato che ho caricato il file "mare.jpg"
    Quando carico il file "montagna.jpg"
    Allora l'anteprima mostra la nuova foto
    E vedo il nome del file "montagna.jpg"

  Scenario: Togliere la foto
    Dato che ho caricato il file "mare.jpg"
    Quando tocco "Rimuovi foto"
    Allora l'anteprima mostra di nuovo il segnaposto "La tua foto"
    E il riepilogo non mostra la voce di stampa
    