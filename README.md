# E-commerce — complementi d'arredo

Web app e-commerce per piccoli complementi d'arredo, oggettistica e cornici, realizzata come prototipo di tirocinio.

## Funzionalità presenti

- Catalogo con filtri per categoria.
- Scheda prodotto con nome, prezzo e descrizione.
- Scena «Compra il look» con punti cliccabili per aprire le schede dei prodotti.

## Requisiti

- Node.js v24.22.0 (versione usata per verificare avvio e test).
- Non sono richiesti altri pacchetti.

## Avvio

1. Apri la cartella principale del progetto nel terminale.
2. Avvia il server:

   ```sh
   node server.js
   ```

3. Apri [http://localhost:3000](http://localhost:3000) nel browser.
4. Per fermare il server, torna al terminale e premi `Ctrl+C`.

## Test

Dalla cartella principale del progetto, esegui:

```sh
node --test tests/catalogo.test.js
```

## Struttura

- `features/`: requisiti e scenari in Gherkin (`.feature`).
- `public/`: file dell'interfaccia web.
- `tests/`: test automatici.
- `docs/`: documentazione e risorse, inclusa l'immagine della scena «Compra il look».

I requisiti sono scritti in Gherkin nei file `.feature` di `features/` e costituiscono la fonte di verità del progetto.
