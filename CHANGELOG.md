# Jurnal de modificări

## 2.0.2 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.0.2 — 2026-11-02

Actualizare a surselor la 2026-11-02.

### Modificat
- SpaceX-API: depozitul `r-spacex/SpaceX-API` a fost arhivat de proprietar la 6 iunie 2026 (GitHub, citit direct); mențiunea a fost adăugată în nota cardurilor SpaceX și în lista „Surse și atribuiri”, în cele 8 limbi.

### Neschimbat
- Restul API-urilor nu au putut fi confirmate ca schimbate; blocul „Stare la 11 octombrie 2026” rămâne cu data lui (nu a fost reverificat integral). Frankfurter: v1 e marcat depreciat, dar rămâne disponibil „pe termen nedefinit” (frankfurter.dev); codul nu a fost schimbat.

## 2.0.1 — 2026-10-27

Recenzie 2026-10-27. Doar documentație și teste; codul aplicației nu a fost schimbat funcțional.

### Modificat
- README (EN, RO): descrierea de la deschidere era depășită. În cod, cele 3 stații principale pornesc doar după acord (bara `#aff-consent`, memorat în `aff_auto_hero`); textul spune acum acest lucru. Titlul README nu mai spune „v1.1.0”.
- Precizat că aplicația nu a fost testată cu servere reale de API (doar răspunsuri simulate / rețea blocată).

### Adăugat
- `tests/consent.test.mjs`: la prima deschidere, după refuz și după reîncărcare nu pleacă nicio cerere; după acord se încearcă doar sursele celor 3 stații.
- Linii „Stare” și „Offline” în README și metadate.

### Neschimbat
- Nimic șters; fără dependențe noi; lista `connect-src` din CSP neschimbată (hash-urile scripturilor recalculate).

Istoricul anterior (până la 2.0.0, 2026-10-26) este în secțiunea „Istoric / Changelog” din README.md.
