// API fără frontiere 2.0.0 — Laboratorul de cereri: colecții, medii, aserțiuni, lanț, cURL, import/export.
import {launch, axeRun, hOverflow, check, summary, AXE} from "./_lib.mjs";
import fs from "fs";

const CORS = {"access-control-allow-origin": "*", "content-type": "application/json"};
const mock = async (page, fn) => {
  const hits = [];
  await page.route(/^https:\/\/(catfact\.ninja|dog\.ceo|api\.open-meteo\.com)\//, route => {
    const u = route.request().url(); hits.push(u);
    const r = fn(u);
    route.fulfill({status: r.status || 200, headers: Object.assign({}, CORS, r.headers || {}), body: r.body === undefined ? JSON.stringify(r.json) : r.body});
  });
  return hits;
};
const real = e => e.filter(x => !/Failed to load resource|net::ERR/.test(x));
const openLab = async page => { await page.click('#labBtn'); await page.waitForSelector('#labModal:not([hidden])'); };
const newReq = async (page, {name, url, asserts = '', extract = ''}) => {
  await page.click('#labReqNew');
  await page.fill('#labReqName', name); await page.fill('#labReqUrl', url);
  await page.fill('#labReqAsserts', asserts); await page.fill('#labReqExtract', extract);
  await page.click('#labReqSave');
};
const out = page => page.textContent('#labOut');

console.log("1. motorul de aserțiuni și căi (unități)");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const d = {a: {b: [{c: "x y", n: 5}], s: "hello", t: true, z: null}, list: [1, 2, 3]};
    const ev = (line, extra) => { const a = labParseAsserts(line)[0]; return labEvalAssert(a, Object.assign({status: 200, ms: 50, text: JSON.stringify(d), json: {ok: true, data: d}}, extra || {})).ok; };
    return {
      p1: JSON.stringify(labPath('$.a.b[0].c')), p2: JSON.stringify(labPath('$["a"]["s"]')), p3: labPath('a.b'), p4: labPath('$..x'), p5: JSON.stringify(labPath('$.list.length')),
      s200: ev('status 200'), s2xx: ev('status 2xx'), s404: ev('status 404'), sne: ev('status != 404'), s5xx: ev('status 5xx', {status: 503}),
      tlt: ev('time < 100'), tfail: ev('time < 10'),
      ex: ev('$.a.b[0].c exists'), nex: ev('$.a.q not exists'), exnull: ev('$.a.z exists'),
      isn: ev('$.a.b[0].n is number'), iss: ev('$.a.s is string'), isa: ev('$.list is array'), isnull: ev('$.a.z is null'), isbad: ev('$.a.s is number'),
      eq: ev('$.a.s == "hello"'), eqb: ev('$.a.s == hello'), eqn: ev('$.a.b[0].n == 5'), eqt: ev('$.a.t == true'), ne: ev('$.a.s != "x"'),
      gt: ev('$.a.b[0].n >= 5'), lt: ev('$.a.b[0].n < 5'), len: ev('$.list.length > 2'), lenstr: ev('$.a.s.length == 5'),
      cmpstr: ev('$.a.s > 3'),
      c1: ev('$.a.s contains ell'), c2: ev('$.a.s startsWith hel'), c3: ev('$.list contains 2'), c4: ev('$.list contains 9'),
      body: ev('body contains hello'), bodyno: ev('body contains nope'),
      miss: ev('$.nope == 1'), bad: labParseAsserts('blah blah')[0].k, comment: labParseAsserts('# nimic\n\n  ').length,
      nojson: ev('$.a exists', {json: {ok: false}}), nojsonneg: ev('$.a not exists', {json: {ok: false}}),
      ex2: JSON.stringify(labParseExtract('x = $.a.s\n# c\nbad line\n1x = $.a')),
      sub1: JSON.stringify(labSub('https://catfact.ninja/{{p}}?q={{q}}', {p: 'a b', q: 'a&b c'})),
      sub2: JSON.stringify(labSub('https://dog.ceo/api/{{p}}/x', {p: 'breed/hound'})),
      sub3: JSON.stringify(labSub('https://x/{{nope}}', {})),
      hosts: labHosts().length, hostok: labHostOk('catfact.ninja'), hostno: labHostOk('evil.example'), hostsub: labHostOk('catfact.ninja.evil.com'),
      u1: labCheckUrl('http://catfact.ninja/fact').err ? 'err' : 'ok', u2: labCheckUrl('https://evil.example/').err ? 'err' : 'ok', u3: labCheckUrl('https://user:pw@catfact.ninja/').err ? 'err' : 'ok', u4: labCheckUrl('https://catfact.ninja/fact').err ? 'err' : 'ok', u5: labCheckUrl('javascript:alert(1)').err ? 'err' : 'ok', u6: labCheckUrl('').err ? 'err' : 'ok'
    };
  });
  const expect = {p1: '["a","b",0,"c"]', p2: '["a","s"]', p3: null, p4: null, p5: '["list","length"]', s200: true, s2xx: true, s404: false, sne: true, s5xx: true, tlt: true, tfail: false, ex: true, nex: true, exnull: true, isn: true, iss: true, isa: true, isnull: true, isbad: false, eq: true, eqb: true, eqn: true, eqt: true, ne: true, gt: true, lt: false, len: true, lenstr: true, cmpstr: false, c1: true, c2: true, c3: true, c4: false, body: true, bodyno: false, miss: false, bad: 'bad', comment: 0, nojson: false, nojsonneg: true, hostok: true, hostno: false, hostsub: false, u1: 'err', u2: 'err', u3: 'err', u4: 'ok', u5: 'err', u6: 'err'};
  for (const k of Object.keys(expect)) check("unit " + k, r[k] === expect[k], r[k]);
  check("extragere: 1 validă + 2 invalide", r.ex2.split('"bad":true').length - 1 === 2 && r.ex2.includes('"name":"x"'), r.ex2);
  check("variabile: interogarea se codifică, calea doar caractere sigure", JSON.parse(r.sub1).url === 'https://catfact.ninja/a%20b?q=a%26b%20c', r.sub1);
  check("variabile: slash permis în cale", JSON.parse(r.sub2).url === 'https://dog.ceo/api/breed/hound/x', r.sub2);
  check("variabilă lipsă raportată", JSON.parse(r.sub3).missing[0] === 'nope');
  check("lista de gazde vine din CSP", r.hosts > 30, r.hosts);
  check("0 erori", real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("2. deschidere, exemplu, rulare cu succes");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  const hits = await mock(page, u => ({json: {fact: "Pisicile dorm mult", length: 18}}));
  check("buton laborator în antet", await page.locator('#labBtn').isVisible());
  await openLab(page);
  check("dialog modal cu titlu", (await page.getAttribute('#labModal [role=dialog]', 'aria-labelledby')) === 'labTitle');
  check("fără colecții la început", (await page.locator('#labColSel option').first().textContent()).includes('nicio') && await page.isDisabled('#labRunAll'));
  await page.click('#labColExample');
  check("exemplu adăugat, cerere deschisă în editor", (await page.inputValue('#labReqUrl')) === 'https://catfact.ninja/fact' && await page.isVisible('#labEditor'));
  await page.click('#labReqRun');
  await page.waitForSelector('.lab-sum');
  const o = await out(page);
  check("rezultat: trecut + status + sumar", /✓/.test(o) && /HTTP 200/.test(o) && /1\/1 cereri trecute/.test(o), o.slice(0, 200));
  check("variabilă extrasă afișată", /fact_len=18/.test(o));
  check("o singură cerere de rețea", hits.length === 1, hits);
  check("sumar primește focus", await page.evaluate(() => document.activeElement.classList.contains('lab-sum')));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aff_lab')));
  check("persistat în aff_lab, cu ultimul răspuns", stored.cols.length === 1 && stored.cols[0].reqs[0].last.status === 200 && /Pisicile/.test(stored.cols[0].reqs[0].last.text));
  // rulare a doua: identic
  await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  check("a doua rulare: identic cu anterioara", /Identic/.test(await out(page)));
  await page.reload(); await page.waitForTimeout(500);
  await openLab(page);
  check("după reîncărcare: colecția și cererea rămân", (await page.inputValue('#labReqName')) !== '' && (await page.locator('.lab-reqbtn').count()) === 1);
  check("0 erori", real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("3. aserțiuni eșuate, status, non-JSON");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  let mode = 'ok';
  const hits = await mock(page, u => mode === 'ok' ? {json: {n: 3, name: "ab"}} : (mode === '404' ? {status: 404, json: {error: 'nu'}} : {body: "<html>nu e json</html>", headers: {"content-type": "text/html"}}));
  await openLab(page);
  await page.click('#labColNew');
  await newReq(page, {name: 'T1', url: 'https://catfact.ninja/a', asserts: 'status 200\n$.n == 4\n$.name contains zz\n$.n is number\ntime < 99999\nfoo bar'});
  await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  let o = await out(page);
  check("rezultat eșuat marcat ✗ și „eșuat”", /✗ T1/.test(o) && /eșuat/.test(o));
  check("aserțiunea picată arată valoarea obținută", /\$\.n == 4 — obținut: 3/.test(o), o);
  check("aserțiunea trecută e ✓", /✓ \$\.n is number/.test(o));
  check("linie neînțeleasă raportată ca eșec", /✗ foo bar/.test(o));
  check("sumar eșuat 0/1", /0\/1 cereri/.test(o));
  mode = '404';
  await page.fill('#labReqAsserts', ''); await page.click('#labReqSave'); await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  o = await out(page);
  check("status implicit 2xx pică la 404", /✗ status 2xx — obținut: 404/.test(o), o);
  await page.fill('#labReqAsserts', 'status 404\n$.error == nu'); await page.click('#labReqSave'); await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  check("status 404 așteptat explicit trece", /1\/1 cereri trecute/.test(await out(page)));
  mode = 'html';
  await page.fill('#labReqAsserts', 'body contains nu e json\n$.x exists'); await page.click('#labReqSave'); await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  o = await out(page);
  check("non-JSON: body contains trece, calea JSON pică", /✓ body contains nu e json/.test(o) && /✗ \$\.x exists — obținut: răspunsul nu e JSON/.test(o), o);
  check("conținutul HTML nu e interpretat", (await page.locator('#labOut html, #labOut b').count()) === 0);
  check("0 erori", real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("4. medii și variabile");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  const hits = await mock(page, u => ({json: {ok: true}}));
  await openLab(page);
  check("variabilele dezactivate fără mediu", await page.isDisabled('#labVars'));
  await page.click('#labEnvNew');
  check("mediu nou creat și selectat", (await page.inputValue('#labEnvName')) === 'Mediu' && !(await page.isDisabled('#labVars')));
  await page.fill('#labEnvName', 'Dev');
  await page.fill('#labVars', 'host=catfact.ninja\nn=5\nq=a b&c\nbad key=1\n# comentariu\n1x=2');
  await page.click('#labVarsSave');
  check("mediu redenumit", (await page.inputValue('#labEnvName')) === 'Dev');
  const txt = await page.inputValue('#labVars');
  check("doar variabilele valide păstrate", txt === 'host=catfact.ninja\nn=5\nq=a b&c', txt);
  await page.click('#labColNew');
  await newReq(page, {name: 'E1', url: 'https://{{host}}/fact?max={{n}}&q={{q}}', asserts: 'status 200'});
  await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  check("cerere cu variabile: URL corect", hits.length === 1 && hits[0] === 'https://catfact.ninja/fact?max=5&q=a%20b%26c', hits);
  // al doilea mediu
  await page.click('#labEnvNew'); await page.fill('#labEnvName', 'Prod'); await page.fill('#labVars', 'host=dog.ceo\nn=7\nq=z'); await page.click('#labVarsSave');
  await page.click('.lab-reqbtn'); await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  check("alt mediu → alte valori", hits.length === 2 && hits[1] === 'https://dog.ceo/fact?max=7&q=z', hits);
  await page.selectOption('#labEnvSel', 'Dev');
  check("schimbarea mediului arată variabilele lui", (await page.inputValue('#labVars')).startsWith('host=catfact.ninja'));
  // variabilă lipsă
  await page.fill('#labReqUrl', 'https://catfact.ninja/{{lipsa}}'); await page.click('#labReqSave');
  const before = hits.length;
  await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  check("variabilă lipsă: nu se trimite nimic", hits.length === before && /Variabile lipsă: lipsa/.test(await out(page)));
  // variabilă hostilă care încearcă să schimbe gazda
  await page.fill('#labVars', 'host=evil.example/x\nn=1\nq=1'); await page.click('#labVarsSave');
  await page.fill('#labReqUrl', 'https://{{host}}/fact'); await page.click('#labReqSave');
  await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  check("variabilă hostilă în gazdă: blocat", hits.length === before && /nu e permisă|nevalidă/.test(await out(page)), await out(page));
  // ștergere mediu cu confirmare
  await page.click('#labEnvDel');
  await page.waitForSelector('dialog[open], .fff-dlg, [role=alertdialog]', {timeout: 3000}).catch(() => {});
  check("confirmare prin dialogul kitului (nu nativ)", await page.locator('dialog[open]').count() >= 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check("Esc în confirmare nu închide laboratorul", await page.locator('#labModal:not([hidden])').count() === 1);
  check("mediul rămâne după anulare", (await page.locator('#labEnvSel option').count()) === 2);
  await page.click('#labEnvDel');
  await page.waitForSelector('dialog[open]');
  await page.locator('dialog[open] button').filter({hasText: /Da|Șterge|OK/i}).first().click();
  await page.waitForTimeout(300);
  check("mediu șters după confirmare", (await page.locator('#labEnvSel option').count()) === 1);
  check("0 erori", real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("5. securitate: gazde și scheme");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  const hits = await mock(page, u => ({json: {}}));
  const netBefore = st.net.length;
  await openLab(page); await page.click('#labColNew');
  for (const [u, re] of [['https://evil.example/x', /nu e permisă/], ['http://catfact.ninja/fact', /https/], ['javascript:alert(1)', /https|nevalidă/], ['https://catfact.ninja.evil.com/', /nu e permisă/], ['https://user:pw@catfact.ninja/', /nevalidă/], ['', /nu are adresă/], ['ftp://catfact.ninja/', /https/]]) {
    await newReq(page, {name: 'S', url: u});
    await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
    check("blocat: " + (u || '(gol)'), re.test(await out(page)), await out(page));
  }
  check("nicio cerere ajunsă în rețea", hits.length === 0 && st.net.slice(netBefore).filter(x => !/catfact|dog\.ceo/.test(x)).length === 0, st.net.slice(netBefore));
  check("0 violări CSP", (await page.evaluate(() => window.__csp)).length === 0);
  check("0 erori", real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("6. rulare în lanț");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  const hits = await mock(page, u => {
    if (u.includes('catfact.ninja/list')) return {json: {items: [{id: 'husky'}, {id: 'akita'}], total: 2}};
    if (u.includes('dog.ceo/api/breed/husky')) return {json: {message: 'ok', id: 'husky'}};
    return {status: 500, json: {err: 1}};
  });
  await openLab(page); await page.click('#labColNew');
  await newReq(page, {name: 'Lista', url: 'https://catfact.ninja/list', asserts: '$.total == 2\n$.items.length >= 1', extract: 'first = $.items[0].id\ncount = $.total'});
  await newReq(page, {name: 'Detaliu', url: 'https://dog.ceo/api/breed/{{first}}/images?n={{count}}', asserts: '$.id == husky'});
  await newReq(page, {name: 'Pica', url: 'https://dog.ceo/api/nope', asserts: ''});
  await newReq(page, {name: 'Ultima', url: 'https://dog.ceo/api/breed/{{first}}', asserts: '$.id == husky'});
  await page.click('#labRunAll');
  await page.waitForFunction(() => document.querySelector('.lab-sum'), null, {timeout: 15000});
  const o = await out(page);
  check("lanț: a doua cerere folosește valoarea extrasă", hits[1] === 'https://dog.ceo/api/breed/husky/images?n=2', hits);
  check("lanț: 4 cereri rulate", hits.length === 4, hits);
  check("lanț: sumar 3/4", /3\/4 cereri trecute/.test(o), o.slice(-200));
  check("lanț: cererea cu 500 e marcată eșuată", /✗ Pica/.test(o));
  // oprire la prima eroare
  await page.check('#labStop');
  hits.length = 0;
  await page.click('#labRunAll');
  await page.waitForFunction(() => /Oprit la prima/.test(document.getElementById('labOut').textContent), null, {timeout: 15000});
  check("oprire la prima eroare: 3 cereri trimise", hits.length === 3, hits);
  // butonul de oprire apare în timpul rulării
  await page.uncheck('#labStop');
  await page.route('https://dog.ceo/api/slow', async route => { await new Promise(r => setTimeout(r, 1200)); route.fulfill({headers: CORS, body: '{}'}); });
  await page.click('#labReqNew'); await page.fill('#labReqName', 'Lent'); await page.fill('#labReqUrl', 'https://dog.ceo/api/slow'); await page.click('#labReqSave');
  await page.click('#labReqNew'); await page.fill('#labReqName', 'Fin'); await page.fill('#labReqUrl', 'https://dog.ceo/api/breed/husky'); await page.click('#labReqSave');
  await page.click('#labRunAll');
  await page.waitForSelector('#labRunCancel:not([hidden])');
  check("buton „Oprește rularea” vizibil, rulare dezactivată", await page.isDisabled('#labRunAll'));
  await page.click('#labRunCancel');
  await page.waitForFunction(() => document.querySelector('.lab-sum'), null, {timeout: 20000});
  check("rulare oprită manual", /Rulare oprită/.test(await out(page)) && await page.isEnabled('#labRunAll') && await page.isHidden('#labRunCancel'));
  check("0 erori", real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("7. comparare de răspunsuri");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  let v = 1;
  await mock(page, u => ({json: {a: 1, b: v === 1 ? 'x' : 'y', list: v === 1 ? [1, 2] : [1, 2, 3]}}));
  await openLab(page); await page.click('#labColNew');
  await newReq(page, {name: 'D', url: 'https://catfact.ninja/d'});
  await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  check("prima rulare salvată", /Prima rulare/.test(await out(page)));
  v = 2;
  await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  const o = await out(page);
  check("diferențe detectate", /linii diferite/.test(o) && /- {3}"b": "x"/.test(o) && /\+ {3}"b": "y"/.test(o) && /\+ {5}3/.test(o), o);
  await page.reload(); await page.waitForTimeout(500);
  check("ultimul răspuns persistă după reîncărcare", await page.evaluate(() => /"y"/.test(JSON.parse(localStorage.getItem('aff_lab')).cols[0].reqs[0].last.text)));
  await browser.close();
}

console.log("8. cURL și import/export");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(500);
  await mock(page, u => ({json: {ok: 1}}));
  await openLab(page);
  await page.fill('#labCurlIn', "curl -H 'Accept: x' https://catfact.ninja/fact");
  await page.click('#labCurlGo');
  check("cURL fără colecție: mesaj", /nicio colecție/.test(await out(page)));
  await page.click('#labColNew');
  await page.fill('#labCurlIn', "curl -sS -H 'Accept: x' -L 'https://catfact.ninja/fact?max=3'");
  await page.click('#labCurlGo');
  check("cURL GET importat", (await page.inputValue('#labReqUrl')) === 'https://catfact.ninja/fact?max=3' && (await page.inputValue('#labReqAsserts')) === 'status 2xx');
  for (const bad of ["curl -X POST https://catfact.ninja/fact", "curl -d a=1 https://catfact.ninja/fact", "curl --data-raw x https://catfact.ninja/", "wget https://catfact.ninja", "curl http://catfact.ninja/"]) {
    await page.fill('#labCurlIn', bad); await page.click('#labCurlGo');
    check("cURL respins: " + bad, /Doar cereri GET|Nu am găsit/.test(await out(page)), await out(page));
  }
  await page.fill('#labCurlIn', "curl -X GET \"https://catfact.ninja/x y\""); await page.click('#labCurlGo');
  check("cURL -X GET acceptat", (await page.locator('.lab-reqbtn').count()) === 2);
  await page.click('.lab-reqbtn >> nth=0');
  await page.click('#labReqCurl');
  check("export cURL", (await page.textContent('#labCurlOut')) === "curl -sS 'https://catfact.ninja/fact?max=3'");
  // export / import JSON
  await page.click('#labEnvNew'); await page.fill('#labVars', 'k=v'); await page.click('#labVarsSave');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#labColExport')]);
  const exp = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  check("export: format și conținut", exp.app === 'api-fara-frontiere' && exp.kind === 'lab' && exp.cols[0].reqs.length === 2 && exp.envs.Mediu.k === 'v' && !('last' in exp.cols[0].reqs[0]));
  await page.setInputFiles('#labFile', {name: 'c.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exp))});
  await page.waitForFunction(() => /Importat/.test(document.getElementById('labOut').textContent));
  check("import: colecție adăugată (2), mediu redenumit", (await page.locator('#labColSel option').count()) === 2 && (await page.locator('#labEnvSel option').count()) === 2);
  const hostile = {app: 'api-fara-frontiere', kind: 'lab', version: 1, envs: {"__proto__": {"x": "1"}, "ok": {"__proto__": "z", "a b": "1", "good": "<img src=x onerror=window.__pwn=1>"}}, cols: [{name: "<b>c</b>", reqs: [{name: "<img src=x onerror=window.__pwn=1>", url: "javascript:alert(1)", asserts: 5, extract: null}, 7, null]}, "x"]};
  await page.setInputFiles('#labFile', {name: 'h.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(hostile))});
  await page.waitForFunction(() => /Importat/.test(document.getElementById('labOut').textContent));
  check("import ostil: fără execuție, fără poluare", await page.evaluate(() => !window.__pwn && ({}).x === undefined && ({}).a === undefined));
  await page.selectOption('#labColSel', {label: '<b>c</b>'});
  check("nume HTML afișat ca text", (await page.locator('#labColSel option:checked').textContent()) === '<b>c</b>' && (await page.locator('.lab-reqbtn').first().innerHTML()).includes('&lt;img'));
  await page.setInputFiles('#labFile', {name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{nu e json')});
  await page.waitForFunction(() => /invalid/i.test(document.getElementById('labOut').textContent));
  check("fișier invalid respins", true);
  check("0 erori", real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("9. date corupte în aff_lab");
{
  const {browser, page, st} = await launch();
  await page.evaluate(() => localStorage.setItem('aff_lab', '{{{ nu e json'));
  await page.reload(); await page.waitForTimeout(500);
  await openLab(page);
  check("JSON corupt: laborator gol, fără erori", (await page.locator('#labColSel option').first().textContent()).includes('nicio') && real(st.errs).length === 0, st.errs);
  await page.evaluate(() => localStorage.setItem('aff_lab', JSON.stringify({envs: {a: {"x y": 1, ok: {n: 1}}, b: 5, "__proto__": {z: 1}}, cols: [{id: "!!", name: 5, reqs: [{id: "ab c", name: {}, url: 5, asserts: [], last: {text: 5}}]}, null, 3], env: 'zzz', sel: 'nu'})));
  await page.reload(); await page.waitForTimeout(500);
  await openLab(page);
  check("structură ciudată normalizată", (await page.locator('.lab-reqbtn').count()) === 1 && real(st.errs).length === 0, st.errs);
  await browser.close();
}

console.log("10. accesibilitate și telefon");
{
  const {browser, page, st} = await launch({w: 390, h: 800});
  await page.waitForTimeout(500);
  await mock(page, u => ({json: {}}));
  await openLab(page);
  await page.click('#labColExample');
  check("fără depășire orizontală (390px)", (await hOverflow(page)) <= 0);
  const inside = [];
  for (let i = 0; i < 45; i++) { await page.keyboard.press('Tab'); inside.push(await page.evaluate(() => !!document.activeElement.closest('#labModal'))); }
  check("focusul rămâne în dialog", inside.every(Boolean));
  const small = await page.evaluate(() => [...document.querySelectorAll('#labModal button, #labModal input:not([type=hidden]):not([hidden]), #labModal select, #labModal textarea, #labModal summary')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return [e.id || e.className, Math.round(r.width), Math.round(r.height)]; }).filter(x => x[2] < 24 || x[1] < 24));
  check("ținte de atingere ≥ 24px", small.length === 0, small);
  await page.keyboard.press('Escape');
  check("Esc închide laboratorul", await page.locator('#labModal[hidden]').count() === 1);
  check("focus revine pe butonul din antet", await page.evaluate(() => document.activeElement.id) === 'labBtn');
  await browser.close();
}
if (AXE) {
  console.log("11. axe");
  const {browser, page} = await launch({bypassCSP: true});
  await page.waitForTimeout(500);
  await mock(page, u => ({json: {fact: 'x', length: 1}}));
  await openLab(page); await page.click('#labColExample'); await page.click('#labReqRun'); await page.waitForSelector('.lab-sum');
  const r = await axeRun(page);
  check("axe laborator (cu rezultate): 0 încălcări", r.length === 0, r);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  const r2 = await axeRun(page);
  check("axe laborator (tema deschisă): 0 încălcări", r2.length === 0, r2);
  await browser.close();
}
summary();
