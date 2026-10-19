# API fără frontiere — stazione di ricezione · v1.1.0

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versione:** 1.1.0 · **Ultimo aggiornamento:** 2026-10-14

Un unico file HTML con 52 widget (47 su API pubbliche — meteo, spazio, arte, libri, tassi di cambio, verifica delle password, ecc. — e 5 utilità locali che funzionano offline), senza account, senza telemetria propria, senza server proprio.

**App online:** https://chiuta.github.io/API-fara-frontiere/

![Schermata](screenshot.png)

## Che cos'è

Una pagina-indice di «stazioni»: ogni scheda interroga direttamente, dal tuo browser, un'API pubblica gratuita e mostra il risultato. Non esiste alcun server intermedio dell'autore. A differenza delle applicazioni offline della stessa serie, questa **ha bisogno di internet** per mostrare i dati: il file in sé non contiene i dati, ma solo l'interfaccia.

I 52 widget sono raggruppati in 16 categorie: Meteo & Ambiente, Spazio, Animali, Arte & Cultura, Intrattenimento, Musica, Cibo & Bevande, Finanza & Cripto, Paesi & Geografia, Parole & Conoscenza, Umorismo & Ispirazione, Sicurezza, Salute, Identità & Dati di prova, Sviluppo & Utilità, Locale · senza rete.

## Funzioni

Verificate nel codice e in test automatici con risposte simulate (durante la verifica non ho potuto usare la rete esterna):

- 52 schede (47 online + 5 locali), con ricerca (senza distinzione dei segni diacritici), filtro per categoria e preferiti (★, conservati in locale).
- Ogni richiesta ha un timeout di 12 s; in caso di errore la scheda mostra la causa (rete non disponibile, tempo scaduto, HTTP nnn) e un pulsante «Riprova». Il pulsante di richiesta è bloccato finché una richiesta è in corso; Invio nei campi avvia la richiesta.
- I dati ricevuti dalle API vengono sottoposti a escape prima della visualizzazione; i collegamenti esterni sono accettati solo se `http(s)`.
- «Password compromessa?»: calcola localmente lo SHA-1 e invia a Have I Been Pwned solo i primi 5 caratteri dell'impronta (k-anonimato); la password non lascia il browser.
- **Locale · senza rete** (nessuna richiesta, funzionano offline): generatore di password (`crypto.getRandomValues`, senza bias, entropia stimata), UUID v4, hash di testo (SHA-256/384/512, SHA-1, Web Crypto — richiede un contesto sicuro), tempo Unix ↔ data, Base64 UTF-8; pulsante «Copia».
- **Offline:** barra di avviso quando non hai connessione (con una scorciatoia verso le schede locali); in caso di errore di rete/timeout, la scheda mostra sotto l'errore l'ultimo risultato ottenuto, conservato in locale come testo (facoltativo, disattivabile ed eliminabile dalle Impostazioni; non viene conservato per «Password compromessa?», «Il mio indirizzo IP» e le schede locali).
- Chiave NASA facoltativa (Impostazioni ⚙), `DEMO_KEY` per impostazione predefinita.
- Tema scuro/chiaro, Impostazioni, «Fonti e attribuzioni».

## Guida all'uso

1. Apri la pagina. Le 3 stazioni principali (Meteo adesso, Foto del giorno NASA, ISS) si caricano da sole; puoi disattivarlo dalle Impostazioni ⚙ (vale dalla prossima apertura).
2. Cerca una scheda nel campo in alto o scegli una categoria dalla barra dei filtri.
3. Compila il campo della scheda (città, nome, codice ecc.), se presente, e premi **Ricevi** (o Invio).
4. Se compare «Segnale perso», premi **Riprova** o riprova più tardi: le fonti di terze parti possono essere non disponibili o limitare il traffico.
5. Contrassegna le schede preferite con ★ perché compaiano per prime nella loro categoria.
6. Nelle Impostazioni ⚙ puoi salvare una tua chiave NASA (gratuita, da api.nasa.gov) e disattivare il caricamento automatico; «Fonti e attribuzioni» elenca i fornitori.

## Privacy e rete

- **Archiviazione locale (`localStorage`):** `aff_theme` (tema), `aff_favs` (preferiti), `aff_nasa_key` (la chiave NASA, in chiaro, se la salvi), `aff_auto_hero` (caricamento automatico), `aff_last` (ultimo risultato delle schede, come testo, max. 600 caratteri per scheda) e `aff_keep_last` (l'opzione per conservarlo). Non si usano cookie, `sessionStorage` o IndexedDB. Se l'archiviazione è bloccata (modalità privata), l'app funziona senza.
- **All'apertura vengono contattate automaticamente 3 fonti** (se non disattivi il caricamento automatico dalle Impostazioni): `geocoding-api.open-meteo.com` e `api.open-meteo.com` (la città della scheda «Meteo adesso», Bucarest per impostazione predefinita), `api.nasa.gov` (la tua chiave o `DEMO_KEY`; più l'immagine da `apod.nasa.gov`) e `api.wheretheiss.at`. Con il caricamento automatico disattivato, all'apertura non viene inviata alcuna richiesta (testato).
- **Tutte le altre schede contattano la fonte solo dopo che premi il pulsante** nella scheda. Ciò che digiti (città, nome, partita IVA, VIN, codice a barre, testo per il QR ecc.) viene inviato alla rispettiva fonte; il testo per il codice QR va a `api.qrserver.com`.
- Ogni fonte contattata vede il tuo indirizzo IP. Le richieste vengono inviate senza cookie e senza intestazione Referer.
- La pagina ha una `Content-Security-Policy` (meta); lo script proprio è consentito tramite hash SHA-256 (senza `'unsafe-inline'` in `script-src`), e `connect-src` è un elenco di domini: `connect-src` contiene esattamente gli host chiamati dal codice (verificato tramite inventario). L'elenco delle immagini (`img-src`) include anche host in cui le immagini sono indicate dalle risposte delle API (ad es. `image.tmdb.org`, `*.archive.org`, `raw.githubusercontent.com`); non è stato possibile confermarlo senza rete.
- Host delle API: open-meteo (3 sottodomini), sunrise-sunset.org, nasa.gov, wheretheiss.at, open-notify.org, spacexdata.com, dog.ceo, catfact.ninja, randomfox.ca, artic.edu, metmuseum.org, openlibrary.org, ghibliapi.vercel.app, tvmaze.com, rickandmortyapi.com, pokeapi.co, deckofcardsapi.com, itunes.apple.com, themealdb.com, thecocktaildb.com, openfoodfacts.org, frankfurter.dev, coingecko.com, vatcomply.com, restcountries.com, date.nager.at, dictionaryapi.dev, ro/en.wikipedia.org, numbersapi.com, opentdb.com, jokeapi.dev, chucknorris.io, adviceslip.com, pwnedpasswords.com, api.fda.gov, disease.sh, genderize.io, agify.io, nationalize.io, randomuser.me, api.github.com, hacker-news.firebaseio.com, vpic.nhtsa.dot.gov, universities.hipolabs.com, ipapi.co.
- Permessi del browser: nessuno.

## Limiti e avvertenze

- L'applicazione non ha alcun controllo sulle API: possono andare offline, cambiare formato, limitare le richieste o restituire dati vecchi. Non ho potuto verificare dall'ambiente di test la disponibilità, il CORS, le chiavi o i limiti attuali di nessuna di esse; le condizioni di ciascun fornitore vanno consultate direttamente alla fonte. Noti come fragili/non verificati: Open Notify (solo HTTP, non sicuro), SpaceX-API (dati della comunità, possibilmente non aggiornati), NumbersAPI, disease.sh (archivio), CoinGecko e ipapi.co (limiti per l'accesso senza chiave), TheMealDB/TheCocktailDB (chiave pubblica di prova).
- I dati nei widget hanno carattere informativo. **Etichetta del medicinale (FDA):** testo in inglese, solo per prodotti degli Stati Uniti; non è un parere medico e non sostituisce il medico o il farmacista. **Tasso di cambio, criptovalute, IVA:** non sono consulenza finanziaria né conferma ufficiale. **Previsione dal nome:** stima statistica, spesso sbagliata; non usarla per decisioni riguardanti le persone.
- Le immagini di NASA, musei, TVmaze ecc. possono essere soggette a diritto d'autore o a licenze proprie; la scheda NASA mostra il credito quando viene fornito. Vedi «Fonti e attribuzioni» nell'app.
- Il widget «Fatto di Chuck Norris» mostra battute assurde prese da un'API di terze parti (la categoria «explicit» viene evitata, il filtraggio non è garantito).
- Verificato con risposte simulate, non con i server reali.

## Esecuzione locale / offline

Scarica `index.html` e aprilo nel browser. L'interfaccia si avvia senza internet, ma le schede mostrano dati solo con una connessione a internet.

## Cronologia / Changelog

### 1.1.0 — 2026-10-14
- Copia di riserva ed etichettatura dei dati (fff-kit).

### 12 ottobre 2026 — versione 1.0.4
- 1.0.4 — 2026-10-12: la versione e la data dell'ultimo aggiornamento sono mostrate nell'app

### 11 ottobre 2026 (terzo passaggio) — versione 1.0.3
- Il caricamento automatico delle 3 stazioni non parte più finché il browser segnala «offline» (niente errori rossi inutili); le richieste rinviate vengono eseguite una sola volta alla riconnessione. Stile di stampa (solo le stazioni, senza comandi). CSP: hash ricalcolato.

### 11 ottobre 2026 (secondo passaggio) — versione 1.0.2
- Nuova categoria «Locale · senza rete» con 5 utilità che funzionano senza internet (generatore di password, UUID v4, hash, tempo Unix, Base64); barra offline; l'ultimo risultato salvato compare sotto gli errori di rete (facoltativo, eliminabile); 52 widget in 16 categorie; CSP: hash ricalcolato (nessun nuovo host).

### 11 ottobre 2026
- Versione 1.0.1 (mostrata in «Informazioni sulla stazione»).
- Accessibilità: il titolo «API fără frontiere» è ora un `<h1>` e i titoli delle schede sono `<h2>` (ordine corretto dei titoli); axe-core segnala 0 violazioni a 1280 e 360 px.
- CSP: `script-src` usa un hash SHA-256 invece di `'unsafe-inline'`.
- La finestra «Fonti e attribuzioni» indica esplicitamente che disponibilità/formato delle API non hanno potuto essere ricontrollati l'11 ottobre 2026 (senza accesso alla rete); il widget «Password compromessa?» è stato ritestato con una risposta simulata (funziona).

**Fonti verificate l'11.10.2026:** nessuna: lo stato delle API di terze parti (NumbersAPI, disease.sh, SpaceX-API, ipapi.co ecc.) non ha potuto essere confermato da fonti primarie l'11.10.2026; l'elenco mantiene l'avvertenza esistente.

## Licenza

MIT — vedi il file LICENSE.

## Autore

Alexio — Alexandru-Ionuț Chiuță, contatto: alexio@trom.tf

## Riepilogo

API fără frontiere è una dashboard HTML in un unico file con 52 widget (47 su API pubbliche gratuite più 5 strumenti locali che funzionano offline) (meteo, spazio, arte, libri, valute, verifica di violazione delle password, ecc.), senza account e senza telemetria propria. A differenza delle app offline di questa serie, ha bisogno di internet per mostrare i dati. Tre widget (meteo, immagine NASA, ISS) si caricano automaticamente all'apertura salvo disattivazione nelle Impostazioni; ogni altro widget contatta la propria fonte solo quando premi il suo pulsante, e ogni fonte vede il tuo indirizzo IP. I dati sono stati testati solo con risposte simulate; la disponibilità e le condizioni delle API di terze parti non sono verificate. Licenza: MIT (vedi LICENSE).
