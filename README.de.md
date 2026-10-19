# API fără frontiere — Empfangsstation · v1.0.4

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · **Deutsch** · [Magyar](README.hu.md)

**Version:** 1.1.0 · **Zuletzt aktualisiert:** 2026-10-14

Eine einzige HTML-Datei mit 52 Widgets (47 über öffentliche APIs — Wetter, Weltraum, Kunst, Bücher, Wechselkurse, Passwortprüfung usw. — und 5 lokale Hilfsprogramme, die offline funktionieren), ohne Konto, ohne eigene Telemetrie, ohne eigenen Server.

**Live-App:** https://chiuta.github.io/API-fara-frontiere/

![Screenshot](screenshot.png)

## Was es ist

Eine Indexseite aus „Stationen“: Jede Karte fragt direkt aus deinem Browser eine kostenlose öffentliche API ab und zeigt das Ergebnis an. Es gibt keinen zwischengeschalteten Server des Autors. Anders als die Offline-Anwendungen derselben Reihe **benötigt diese Internet**, um Daten anzuzeigen: Die Datei selbst enthält nicht die Daten, sondern nur die Oberfläche.

Die 52 Widgets sind in 16 Kategorien gruppiert: Wetter & Umwelt, Weltraum, Tiere, Kunst & Kultur, Unterhaltung, Musik, Essen & Trinken, Finanzen & Krypto, Länder & Geografie, Wörter & Wissen, Humor & Inspiration, Sicherheit, Gesundheit, Identität & Testdaten, Entwicklung & Hilfsprogramme, Lokal · ohne Netzwerk.

## Funktionen

Im Code und in automatisierten Tests mit simulierten Antworten geprüft (bei der Prüfung konnte ich das externe Netzwerk nicht nutzen):

- 52 Karten (47 online + 5 lokal), mit Suche (ohne Beachtung von Diakritika), Filterung nach Kategorie und Favoriten (★, lokal gespeichert).
- Jede Anfrage hat ein Zeitlimit von 12 s; bei einem Fehler zeigt die Karte die Ursache an (Netzwerk nicht verfügbar, Zeitüberschreitung, HTTP nnn) und eine Schaltfläche „Erneut versuchen“. Die Anfrage-Schaltfläche ist gesperrt, solange eine Anfrage läuft; Eingabe in den Feldern löst die Anfrage aus.
- Von den APIs empfangene Daten werden vor der Anzeige maskiert (escaped); externe Links werden nur akzeptiert, wenn sie `http(s)` sind.
- „Passwort kompromittiert?“: berechnet SHA-1 lokal und sendet nur die ersten 5 Zeichen des Fingerabdrucks an Have I Been Pwned (k-Anonymität); das Passwort verlässt den Browser nicht.
- **Lokal · ohne Netzwerk** (keine Anfragen, funktionieren offline): Passwortgenerator (`crypto.getRandomValues`, ohne Bias, geschätzte Entropie), UUID v4, Text-Hash (SHA-256/384/512, SHA-1, Web Crypto — erfordert einen sicheren Kontext), Unix-Zeit ↔ Datum, Base64 UTF-8; Schaltfläche „Kopieren“.
- **Offline:** Warnleiste, wenn keine Verbindung besteht (mit einer Verknüpfung zu den lokalen Karten); bei einem Netzwerkfehler/Zeitüberschreitung zeigt die Karte unter dem Fehler das letzte erfolgreiche Ergebnis, lokal als Text gespeichert (optional, in den Einstellungen deaktivier- und löschbar; nicht gespeichert für „Passwort kompromittiert?“, „Meine IP-Adresse“ und die lokalen Karten).
- Optionaler NASA-Schlüssel (Einstellungen ⚙), standardmäßig `DEMO_KEY`.
- Dunkles/helles Design, Einstellungen, „Quellen und Quellenangaben“.

## Bedienungsanleitung

1. Öffne die Seite. Die 3 Hauptstationen (Wetter jetzt, NASA-Bild des Tages, ISS) laden von selbst; du kannst das in den Einstellungen ⚙ abschalten (gilt ab dem nächsten Öffnen).
2. Suche eine Karte im oberen Feld oder wähle eine Kategorie in der Filterleiste.
3. Fülle das Feld der Karte aus (Stadt, Name, Code usw.), falls vorhanden, und drücke **Empfangen** (oder die Eingabetaste).
4. Erscheint „Signal verloren“, drücke **Erneut versuchen** oder versuche es später: Drittquellen können nicht verfügbar sein oder den Datenverkehr begrenzen.
5. Markiere deine Lieblingskarten mit ★, damit sie in ihrer Kategorie zuerst erscheinen.
6. In den Einstellungen ⚙ kannst du einen eigenen NASA-Schlüssel speichern (kostenlos, von api.nasa.gov) und das automatische Laden abschalten; „Quellen und Quellenangaben“ listet die Anbieter auf.

## Datenschutz und Netzwerk

- **Lokale Speicherung (`localStorage`):** `aff_theme` (Design), `aff_favs` (Favoriten), `aff_nasa_key` (der NASA-Schlüssel, im Klartext, falls du ihn speicherst), `aff_auto_hero` (automatisches Laden), `aff_last` (letztes Ergebnis der Karten, als Text, max. 600 Zeichen pro Karte) und `aff_keep_last` (die Option, es zu behalten). Es werden keine Cookies, kein `sessionStorage` und keine IndexedDB verwendet. Ist die Speicherung blockiert (privater Modus), funktioniert die App ohne sie.
- **Beim Öffnen werden automatisch 3 Quellen kontaktiert** (sofern du das automatische Laden nicht in den Einstellungen abschaltest): `geocoding-api.open-meteo.com` und `api.open-meteo.com` (die Stadt der Karte „Wetter jetzt“, standardmäßig Bukarest), `api.nasa.gov` (dein Schlüssel oder `DEMO_KEY`; dazu das Bild von `apod.nasa.gov`) und `api.wheretheiss.at`. Bei abgeschaltetem automatischem Laden wird beim Öffnen keine Anfrage gesendet (getestet).
- **Alle anderen Karten kontaktieren ihre Quelle erst, nachdem du die Schaltfläche** in der Karte drückst. Was du eingibst (Stadt, Name, USt-IdNr., VIN, Barcode, Text für den QR-Code usw.), wird an die jeweilige Quelle gesendet; Text für den QR-Code geht an `api.qrserver.com`.
- Jede kontaktierte Quelle sieht deine IP-Adresse. Die Anfragen werden ohne Cookies und ohne Referer-Header gesendet.
- Die Seite hat eine `Content-Security-Policy` (Meta); das eigene Skript wird per SHA-256-Hash erlaubt (kein `'unsafe-inline'` in `script-src`), und `connect-src` ist eine Liste von Domains: `connect-src` enthält genau die vom Code aufgerufenen Hosts (per Inventur geprüft). Die Bilderliste (`img-src`) umfasst auch Hosts, auf denen die Bilder durch die Antworten der APIs angegeben werden (z. B. `image.tmdb.org`, `*.archive.org`, `raw.githubusercontent.com`); dies konnte ohne Netzwerk nicht bestätigt werden.
- API-Hosts: open-meteo (3 Subdomains), sunrise-sunset.org, nasa.gov, wheretheiss.at, open-notify.org, spacexdata.com, dog.ceo, catfact.ninja, randomfox.ca, artic.edu, metmuseum.org, openlibrary.org, ghibliapi.vercel.app, tvmaze.com, rickandmortyapi.com, pokeapi.co, deckofcardsapi.com, itunes.apple.com, themealdb.com, thecocktaildb.com, openfoodfacts.org, frankfurter.dev, coingecko.com, vatcomply.com, restcountries.com, date.nager.at, dictionaryapi.dev, ro/en.wikipedia.org, numbersapi.com, opentdb.com, jokeapi.dev, chucknorris.io, adviceslip.com, pwnedpasswords.com, api.fda.gov, disease.sh, genderize.io, agify.io, nationalize.io, randomuser.me, api.github.com, hacker-news.firebaseio.com, vpic.nhtsa.dot.gov, universities.hipolabs.com, ipapi.co.
- Browserberechtigungen: keine.

## Grenzen und Warnungen

- Die Anwendung hat keine Kontrolle über die APIs: Sie können ausfallen, ihr Format ändern, Anfragen begrenzen oder veraltete Daten liefern. Ich konnte aus der Testumgebung weder Verfügbarkeit, CORS, Schlüssel noch aktuelle Limits irgendeiner davon prüfen; die Bedingungen jedes Anbieters sind direkt an der Quelle einzusehen. Als fragil/ungeprüft bekannt: Open Notify (nur HTTP, unsicher), SpaceX-API (Community-Daten, möglicherweise veraltet), NumbersAPI, disease.sh (Archiv), CoinGecko und ipapi.co (Limits für Zugriff ohne Schlüssel), TheMealDB/TheCocktailDB (öffentlicher Testschlüssel).
- Die Daten in den Widgets sind informativ. **Arzneimitteletikett (FDA):** Text auf Englisch, nur für Produkte aus den USA; es ist kein medizinischer Rat und ersetzt weder Arzt noch Apotheker. **Wechselkurs, Kryptowährungen, MwSt.:** kein Finanzrat und keine offizielle Bestätigung. **Vorhersage aus dem Vornamen:** statistische Schätzung, oft falsch; nutze sie nicht für Entscheidungen über Personen.
- Bilder der NASA, von Museen, TVmaze usw. können urheberrechtlich geschützt sein oder eigenen Lizenzen unterliegen; die NASA-Karte zeigt die Quellenangabe an, wenn sie geliefert wird. Siehe „Quellen und Quellenangaben“ in der App.
- Das Widget „Chuck-Norris-Fakt“ zeigt absurde Witze aus einer Drittanbieter-API (die Kategorie „explicit“ wird vermieden, die Filterung ist nicht garantiert).
- Mit simulierten Antworten geprüft, nicht mit den echten Servern.

## Lokale Ausführung / offline

Lade `index.html` herunter und öffne sie im Browser. Die Oberfläche startet ohne Internet, aber die Karten zeigen Daten nur mit Internetverbindung an.

## Verlauf / Changelog

### 1.1.0 — 2026-10-14
- Datensicherung und Datenkennzeichnung (fff-kit).

### 12. Oktober 2026 — Version 1.0.4
- 1.0.4 — 2026-10-12: Die Version und das Datum der letzten Aktualisierung werden in der App angezeigt

### 11. Oktober 2026 (dritter Durchgang) — Version 1.0.3
- Das automatische Laden der 3 Stationen startet nicht mehr, solange der Browser „offline“ meldet (keine unnötigen roten Fehler); aufgeschobene Anfragen laufen bei der Wiederverbindung einmalig. Druckstil (nur die Stationen, ohne Bedienelemente). CSP: Hash neu berechnet.

### 11. Oktober 2026 (zweiter Durchgang) — Version 1.0.2
- Neue Kategorie „Lokal · ohne Netzwerk“ mit 5 Hilfsprogrammen, die ohne Internet funktionieren (Passwortgenerator, UUID v4, Hash, Unix-Zeit, Base64); Offline-Leiste; das zuletzt gespeicherte Ergebnis erscheint unter Netzwerkfehlern (optional, löschbar); 52 Widgets in 16 Kategorien; CSP: Hash neu berechnet (keine neuen Hosts).

### 11. Oktober 2026
- Version 1.0.1 (angezeigt unter „Über die Station“).
- Barrierefreiheit: Der Titel „API fără frontiere“ ist jetzt ein `<h1>`, und die Kartentitel sind `<h2>` (korrekte Überschriftenreihenfolge); axe-core meldet 0 Verstöße bei 1280 und 360 px.
- CSP: `script-src` verwendet einen SHA-256-Hash statt `'unsafe-inline'`.
- Das Fenster „Quellen und Quellenangaben“ vermerkt ausdrücklich, dass Verfügbarkeit/Format der APIs am 11. Oktober 2026 nicht erneut geprüft werden konnten (kein Netzwerkzugang); das Widget „Passwort kompromittiert?“ wurde mit einer simulierten Antwort erneut getestet (funktioniert).

**Am 11.10.2026 geprüfte Quellen:** keine: Der Status der Drittanbieter-APIs (NumbersAPI, disease.sh, SpaceX-API, ipapi.co usw.) konnte am 11.10.2026 nicht anhand von Primärquellen bestätigt werden; die Liste behält den bestehenden Warnhinweis.

## Lizenz

MIT — siehe Datei LICENSE.

## Autor

Alexio — Alexandru-Ionuț Chiuță, Kontakt: alexio@trom.tf

## Zusammenfassung

API fără frontiere ist ein HTML-Dashboard in einer einzigen Datei mit 52 Widgets (47 über kostenlose öffentliche APIs plus 5 lokale Werkzeuge, die offline funktionieren) (Wetter, Weltraum, Kunst, Bücher, Währungen, Passwort-Leak-Prüfung usw.), ohne Konto und ohne eigene Telemetrie. Anders als die Offline-Apps dieser Reihe braucht es Internet, um Daten anzuzeigen. Drei Widgets (Wetter, NASA-Bild, ISS) laden beim Öffnen automatisch, sofern sie nicht in den Einstellungen abgeschaltet werden; jedes andere Widget kontaktiert seine Quelle nur, wenn du seine Schaltfläche drückst, und jede Quelle sieht deine IP-Adresse. Die Daten wurden nur mit simulierten Antworten getestet; Verfügbarkeit und Bedingungen der Drittanbieter-APIs sind nicht geprüft. Lizenz: MIT (siehe LICENSE).
