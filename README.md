# API fără frontiere — stație de recepție

Un singur fișier HTML cu 47 de widgeturi peste API-uri publice (meteo, spațiu, artă, cărți, curs valutar, verificare parolă etc.), fără cont, fără telemetrie proprie, fără server propriu.

**Live:** https://chiuta.github.io/API-fara-frontiere/

![Captura de ecran](screenshot.png)

## Ce este

O pagină-index de „stații”: fiecare card interoghează direct, din browserul tău, un API public gratuit și afișează rezultatul. Nu există server intermediar al autorului. Spre deosebire de aplicațiile offline din aceeași serie, aceasta **are nevoie de internet** pentru a afișa date: fișierul în sine nu conține datele, ci doar interfața.

Cele 47 de widgeturi sunt grupate în 15 categorii: Vreme & Mediu, Spațiu, Animale, Artă & Cultură, Divertisment, Muzică, Mâncare & Băutură, Finanțe & Cripto, Țări & Geografie, Cuvinte & Cunoaștere, Umor & Inspirație, Securitate, Sănătate, Identitate & Date test, Dezvoltare & Utilitare.

## Funcții

Verificate în cod și în teste automate cu răspunsuri simulate (nu am putut folosi rețeaua externă la verificare):

- 47 de carduri, cu căutare (fără diacritice), filtrare pe categorie și favorite (★, păstrate local).
- Fiecare cerere are timeout de 12 s; la eșec cardul afișează cauza (rețea indisponibilă, timp depășit, HTTP nnn) și un buton „Reîncearcă”. Butonul de cerere este blocat cât timp o cerere e în curs; Enter în câmpuri declanșează cererea.
- Datele primite de la API-uri sunt escapate înainte de afișare; legăturile externe sunt acceptate doar dacă sunt `http(s)`.
- „Parolă compromisă?”: calculează local SHA-1 și trimite către Have I Been Pwned doar primele 5 caractere ale amprentei (k-anonimat); parola nu pleacă din browser.
- Cheie NASA opțională (Setări ⚙), implicit `DEMO_KEY`.
- Temă întunecată/luminoasă, Setări, „Surse și atribuiri”.

## Manual de utilizare

1. Deschide pagina. Cele 3 stații principale (Vremea acum, Poza zilei NASA, ISS) se încarcă singure; poți opri asta din Setări ⚙ (se aplică la următoarea deschidere).
2. Caută un card în câmpul de sus sau alege o categorie din bara de filtre.
3. Completează câmpul cardului (oraș, nume, cod etc.), dacă există, și apasă **Recepționează** (sau Enter).
4. Dacă apare „Semnal pierdut”, apasă **Reîncearcă** sau încearcă mai târziu: sursele terțe pot fi indisponibile sau pot limita traficul.
5. Marchează cardurile preferate cu ★ ca să apară primele în categoria lor.
6. În Setări ⚙ poți salva o cheie NASA proprie (gratuită, de la api.nasa.gov) și poți opri încărcarea automată; „Surse și atribuiri” listează furnizorii.

## Confidențialitate și rețea

- **Stocare locală (`localStorage`):** `aff_theme` (temă), `aff_favs` (favorite), `aff_nasa_key` (cheia NASA, în clar, dacă o salvezi), `aff_auto_hero` (încărcare automată). Nu se folosesc cookie-uri, `sessionStorage` sau IndexedDB. Dacă stocarea este blocată (mod privat), aplicația funcționează fără ea.
- **La deschidere se contactează automat 3 surse** (dacă nu dezactivezi încărcarea automată din Setări): `geocoding-api.open-meteo.com` și `api.open-meteo.com` (orașul din cardul „Vremea acum”, implicit București), `api.nasa.gov` (cheia ta sau `DEMO_KEY`; plus imaginea de pe `apod.nasa.gov`) și `api.wheretheiss.at`. Cu încărcarea automată oprită, la deschidere nu se trimite nicio cerere (testat).
- **Toate celelalte carduri contactează sursa doar după ce apeși butonul** din card. Ce tastezi (oraș, nume, cod TVA, VIN, cod de bare, text pentru QR etc.) este trimis sursei respective; text pentru codul QR merge la `api.qrserver.com`.
- Fiecare sursă contactată îți vede adresa IP. Cererile sunt trimise fără cookie-uri și fără antet Referer.
- Pagina are un `Content-Security-Policy` (meta) cu listă de permisiuni pe domenii: `connect-src` conține exact gazdele apelate de cod (verificat prin inventar). Lista de imagini (`img-src`) include și gazde în care imaginile sunt indicate de răspunsurile API-urilor (de ex. `image.tmdb.org`, `*.archive.org`, `raw.githubusercontent.com`); acestea nu au putut fi confirmate fără rețea.
- Gazde API: open-meteo (3 subdomenii), sunrise-sunset.org, nasa.gov, wheretheiss.at, open-notify.org, spacexdata.com, dog.ceo, catfact.ninja, randomfox.ca, artic.edu, metmuseum.org, openlibrary.org, ghibliapi.vercel.app, tvmaze.com, rickandmortyapi.com, pokeapi.co, deckofcardsapi.com, itunes.apple.com, themealdb.com, thecocktaildb.com, openfoodfacts.org, frankfurter.dev, coingecko.com, vatcomply.com, restcountries.com, date.nager.at, dictionaryapi.dev, ro/en.wikipedia.org, numbersapi.com, opentdb.com, jokeapi.dev, chucknorris.io, adviceslip.com, pwnedpasswords.com, api.fda.gov, disease.sh, genderize.io, agify.io, nationalize.io, randomuser.me, api.github.com, hacker-news.firebaseio.com, vpic.nhtsa.dot.gov, universities.hipolabs.com, ipapi.co.
- Permisiuni de browser: niciuna.

## Limite și avertismente

- Aplicația nu are control asupra API-urilor: pot pica, își pot schimba formatul, limita cererile sau pot returna date vechi. Nu am putut verifica din mediul de testare disponibilitatea, CORS-ul, cheile sau limitele actuale ale niciunuia dintre ele; condițiile fiecărui furnizor trebuie consultate direct la sursă. Cunoscut ca fragil/neverificat: Open Notify (doar HTTP/HTTPS nesigur), SpaceX-API (date comunitare, posibil neactualizate), NumbersAPI, disease.sh (arhivă), CoinGecko și ipapi.co (limite pentru acces fără cheie), TheMealDB/TheCocktailDB (cheie publică de test).
- Datele din widgeturi sunt informative. **Etichetă medicament (FDA):** text în engleză, doar pentru produse din SUA; nu e sfat medical, nu înlocuiește medicul sau farmacistul. **Curs valutar, criptomonede, TVA:** nu sunt sfat financiar sau confirmare oficială. **Predicție din prenume:** estimare statistică, adesea greșită; nu o folosi pentru decizii despre persoane.
- Imaginile de la NASA, muzei, TVmaze etc. pot avea drepturi de autor sau licențe proprii; cardul NASA afișează creditul când este furnizat. Vezi „Surse și atribuiri” în aplicație.
- Widgetul „Fapt Chuck Norris” afișează glume absurde preluate dintr-un API terț (se evită categoria „explicit”, filtrarea nu e garantată).
- Verificat cu răspunsuri simulate, nu cu serverele reale.

## Rulare locală / offline

Descarcă `index.html` și deschide-l în browser. Interfața pornește fără internet, dar cardurile afișează date doar cu conexiune la internet.

## Licență

Licența nu este încă declarată.

## Autor

Alexio — Alexandru-Ionuț Chiuță, contact: alexio@trom.tf

## English summary

API fără frontiere is a single-file HTML dashboard of 47 widgets over free public APIs (weather, space, art, books, currency, password breach check, etc.), with no account and no telemetry of its own. Unlike the offline apps in this series it needs internet to show data. Three widgets (weather, NASA picture, ISS) load automatically on open unless disabled in Settings; every other widget contacts its source only when you press its button, and each source sees your IP address. Data was tested against mocked responses only; third-party API availability and terms are not verified. License not yet declared.
