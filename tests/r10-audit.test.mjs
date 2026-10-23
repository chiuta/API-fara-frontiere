// Teste r10 pentru API fără frontiere 1.2.6: articol HN șters (null), geocodare cu coordonate nenumerice, ținte tactile.
// Rulare: node tests/r10-audit.test.mjs   (Playwright din /opt/node-tools; rețeaua externă e simulată)
import {createRequire} from 'module';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire('/opt/node-tools/package.json');
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra ? ' :: ' + JSON.stringify(extra) : '')); } }
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
async function open(routes, mobile) {
  const ctx = await b.newContext({viewport: {width: 390, height: 800}, hasTouch: !!mobile, isMobile: !!mobile});
  const hits = [];
  await ctx.route(/^https?:/, (r) => {
    const u = r.request().url(); hits.push(u);
    for (const [re, body] of routes) if (re.test(u)) return r.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify(body)});
    r.abort();
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(FILE); await p.waitForTimeout(1500);
  return {ctx, p, errs, hits};
}
const click = (p, id) => p.evaluate((id) => { document.querySelector('.station[data-id="' + id + '"] [data-role=go]').click(); }, id);
const screenText = (p, id) => p.evaluate((id) => document.querySelector('.station[data-id="' + id + '"] .station-screen').textContent, id);

console.log('Hacker News: un articol șters (null) nu strică lista');
{
  const {ctx, p, errs} = await open([
    [/topstories\.json/, [1, 2]],
    [/item\/1\.json/, null],
    [/item\/2\.json/, {id: 2, title: 'Titlu ok', score: 7, url: 'https://example.org/a'}],
  ]);
  await click(p, 'hackernews'); await p.waitForTimeout(800);
  const s = await screenText(p, 'hackernews');
  t('lista afișează articolul valid', /Titlu ok/.test(s), s.slice(0, 120));
  t('fără pageerror', errs.length === 0, errs);
  await ctx.close();
}

console.log('Geocodare: coordonate nenumerice nu ajung în URL-ul cererii următoare');
{
  const {ctx, p, hits} = await open([
    [/geocoding-api\.open-meteo\.com/, {results: [{name: 'X', latitude: '1&current=evil', longitude: '2', country: 'Y'}]}],
  ]);
  await click(p, 'weather-now'); await p.waitForTimeout(800);
  t('nicio cerere către api.open-meteo.com/v1/forecast', !hits.some((u) => /api\.open-meteo\.com\/v1\/forecast/.test(u)), hits);
  await ctx.close();
}

console.log('Ținte tactile pe ecran tactil');
{
  const {ctx, p} = await open([], true);
  const small = await p.evaluate(() => [...document.querySelectorAll('.station .btn, .station .inp, .chip, .fav-btn')].filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return [e.className, Math.round(r.height)]; }).filter((x) => x[1] < 44));
  t('butoanele, câmpurile, chip-urile și ☆ au ≥ 44 px înălțime', small.length === 0, small.slice(0, 5));
  const hs = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  t('fără scroll orizontal la 390 px', hs <= 0, hs);
  await ctx.close();
}
await b.close();
console.log('\n' + ok + ' reușite, ' + bad + ' eșuate'); process.exit(bad ? 1 : 0);
