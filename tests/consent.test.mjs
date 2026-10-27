// La prima deschidere nu se contactează nicio sursă; stațiile principale pornesc doar după acord.
// Rețeaua e blocată; verificăm doar ce cereri ar fi încercat pagina (nu există servere reale în test).
import {launch, check, summary} from "./_lib.mjs";
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(1500);
  check("prima deschidere: zero cereri http(s)", st.net.length === 0, st.net);
  check("apare bara de acord", await page.locator("#aff-consent").count() === 1);
  await page.locator("#aff-consent button").nth(1).click();   // "Nu, doar la cerere"
  await page.waitForTimeout(800);
  check("după refuz: tot zero cereri", st.net.length === 0, st.net);
  check("bara dispare", await page.locator("#aff-consent").count() === 0);
  check("refuzul e memorat", await page.evaluate(() => localStorage.getItem("aff_auto_hero")) === "0");
  await page.reload(); await page.waitForTimeout(1200);
  check("după reîncărcare: zero cereri noi, fără întrebare", st.net.length === 0 && await page.locator("#aff-consent").count() === 0, st.net);
  await browser.close();
}
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(800);
  await page.locator("#aff-consent button").nth(0).click();   // "Da, automat"
  await page.waitForTimeout(1500);
  const hosts = [...new Set(st.net.map(u => new URL(u).host))];
  check("după acord: se încearcă doar sursele stațiilor principale", hosts.length > 0 && hosts.every(h => /open-meteo\.com|nasa\.gov|wheretheiss\.at/.test(h)), hosts);
  await browser.close();
}
summary();
