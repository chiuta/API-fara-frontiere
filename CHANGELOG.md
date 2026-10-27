# Jurnal de modificări

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
