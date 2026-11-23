# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Pagamento: dal carrello con articoli si va ai dati di spedizione e ai metodi (Carta di credito, PayPal, Bonifico bancario, nessuno preselezionato); campi obbligatori, CAP a 5 cifre, email valida, prefisso europeo e scelta del metodo sono controllati prima di confermare l'ordine; riepilogo con articolo, spedizione e totale. §REQ:PGMN-DATI-DI-SPDZ-ICN-010, §REQ:PGMN-DATI-DI-SPDZ-ICN-020, §REQ:PGMN-DATI-DI-SPDZ-ICN-030, §REQ:PGMN-DATI-DI-SPDZ-ICN-040, §REQ:PGMN-DATI-DI-SPDZ-ICN-050, §REQ:PGMN-DATI-DI-SPDZ-ICN-060, §REQ:PGMN-DATI-DI-SPDZ-ICN-070, §REQ:PGMN-DATI-DI-SPDZ-ICN-080, §REQ:PGMN-DATI-DI-SPDZ-ICN-090
- Galleria della scheda prodotto: frecce avanti/indietro con ritorno alla prima foto dopo l'ultima, miniature selezionabili (selezionata al 50%) e frecce nere in cerchi color panna al 50%; ora coperta da test. §REQ:GLLR-IMMG-NNT-010, §REQ:GLLR-IMMG-NNT-020, §REQ:GLLR-IMMG-NNT-030, §REQ:GLLR-IMMG-NNT-040, §REQ:GLLR-IMMG-NNT-050, §REQ:GLLR-IMMG-NNT-060, §REQ:GLLR-IMMG-NNT-070
- Coupon "FirstPurchase" (10%): il pulsante "Coupon per te disponibile" compare sulla pagina iniziale solo con carrello oltre 50,00 €, copia il codice negli appunti e lo sconto si applica al pagamento solo oltre la soglia; ora coperto da test. §REQ:CPN-DI-SCNT-QAD-010, §REQ:CPN-DI-SCNT-QAD-020, §REQ:CPN-DI-SCNT-QAD-030, §REQ:CPN-DI-SCNT-QAD-040, §REQ:CPN-DI-SCNT-QAD-050, §REQ:CPN-DI-SCNT-QAD-060, §REQ:CPN-DI-SCNT-QAD-070
- Una cornice personalizzata con foto caricata entra nel carrello con la riga "Stampa foto su carta fotografica: omaggio", senza costi aggiuntivi (30,90 € per la 13x18 Classico/Bianco). §REQ:CRRL-CRNC-PRSN-BCS-020

### Changed
- La riga di una cornice personalizzata e le cornici con scelte diverse (es. Classico e Contemporaneo) restano righe separate nel carrello, con subtotale corretto (63,80 €); ora coperte da test. §REQ:CRRL-CRNC-PRSN-BCS-010, §REQ:CRRL-CRNC-PRSN-BCS-030
