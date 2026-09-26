// Speeltester: speelt het spel echt in Chromium op tablet- en telefoonformaat.
// Gebruik: npm run e2e (bouwt eerst). Screenshots komen in tests/e2e/screenshots/.
import { chromium } from "playwright-core";
import { preview } from "vite";
import { mkdirSync } from "node:fs";
import assert from "node:assert/strict";

const MAP = new URL("./screenshots/", import.meta.url).pathname;
mkdirSync(MAP, { recursive: true });

const server = await preview({ preview: { port: 4173, strictPort: true }, logLevel: "silent" });
const URL_ = "http://localhost:4173/";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
  args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});
const fouten = [];
let stap = 0;

async function nieuweContext(viewport) {
  const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: viewport.width < 700 });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fouten.push(String(e)));
  page.on("console", (m) => m.type() === "error" && fouten.push(m.text()));
  return { ctx, page };
}

const foto = (page, naam) => page.screenshot({ path: `${MAP}${String(++stap).padStart(2, "0")}-${naam}.png` });
const actief = (page) => page.evaluate(() => window.__kk.actief());

/** Klik door de dialoog tot je weer kunt lopen, of tot er iets te kiezen is. */
async function verderTot(page, stop) {
  for (let i = 0; i < 40; i++) {
    if (await stop()) return;
    const knop = page.locator("button.verder");
    if (await knop.count()) await knop.click();
    await page.waitForTimeout(150);
  }
  throw new Error("Bleef hangen in de dialoog");
}
const totWereld = (page) => verderTot(page, () => actief(page));

/** Tik écht op het scherm op een plek in de straat. */
async function tikOp(page, plek) {
  const p = await page.evaluate((pl) => window.__kk.scherm(pl), plek);
  const { width, height } = page.viewportSize();
  if (p.x > 0 && p.y > 0 && p.x < width && p.y < height) await page.touchscreen.tap(p.x, p.y);
  // Buiten beeld: tik via dezelfde route als de glinstering (een kind zou er eerst heen lopen).
  else await page.evaluate((pl) => window.__kk.tik(pl), plek);
}

async function wachtTot(page, fn, arg) {
  await page.waitForFunction(fn, arg, { timeout: 15000 });
}

// ── Tablet: een volledige route ──────────────────────────────
{
  const { ctx, page } = await nieuweContext({ width: 1024, height: 768 });
  await page.goto(URL_);
  await page.getByRole("button", { name: "Nieuw spel" }).click();
  await foto(page, "heldkeuze");
  await page.getByRole("button", { name: "Moos" }).click();
  await page.locator(".dialoog").waitFor();
  await foto(page, "intro");
  await totWereld(page);
  await page.waitForTimeout(400);
  await foto(page, "straat");

  // Lopen door op de straat te tikken
  const voor = await page.evaluate(() => window.__kk.positie());
  await page.touchscreen.tap(300, 380);
  await page.waitForTimeout(1500);
  const na = await page.evaluate(() => window.__kk.positie());
  assert.notDeepEqual(na, voor, "held loopt na tikken");

  // Belletje lellen bij oma Toos
  await tikOp(page, "bel_toos");
  await page.locator("button.bel").waitFor({ timeout: 15000 });
  await foto(page, "minispel");
  await page.locator("button.bel").click({ force: true });
  await page.getByRole("button", { name: /rozenstruik/ }).click();
  await page.locator("p.tekst", { hasText: "Is daar iemand" }).waitFor();
  await foto(page, "bel-gelukt");
  await totWereld(page); // inclusief de automatische scène met de slof
  let t = await page.evaluate(() => window.__kk.toestand());
  assert.ok(t.vlaggen.includes("slof_kwijt"), "slof is kwijt");
  assert.equal(t.ondeugd, 5);
  await page.waitForTimeout(500);
  await foto(page, "masker-en-slof-missie");

  // Splitsmoment
  await tikOp(page, "slof");
  await page.locator(".splitsmoment").waitFor({ timeout: 20000 });
  await verderTot(page, async () => (await page.locator(".keuzes.splits").count()) > 0);
  await foto(page, "splitsmoment");
  await page.getByRole("button", { name: /stiekem terug/ }).click();
  await verderTot(page, async () => (await page.locator(".einde").count()) > 0);
  await page.getByText("De Stille Held").first().waitFor();
  await foto(page, "einde-stille-held");

  // Na herladen staat het einde in het plakboek en is er geen spel om verder te spelen
  await page.reload();
  await page.getByText("Plakboek: 1 van 2").waitFor();
  assert.equal(await page.getByRole("button", { name: "Verder spelen" }).count(), 0);
  await foto(page, "titel-plakboek");

  // Opslaan halverwege: nieuw spel, lopen, herladen, verder spelen
  await page.getByRole("button", { name: "Nieuw spel" }).click();
  await page.getByRole("button", { name: "Tobber" }).click();
  await totWereld(page);
  await tikOp(page, "kabouter");
  await page.locator(".dialoog").waitFor({ timeout: 15000 });
  await verderTot(page, async () => (await page.locator(".keuze").count()) > 0);
  await page.getByRole("button", { name: /op zijn kop/ }).click();
  await totWereld(page);
  const bewaard = await page.evaluate(() => window.__kk.positie());
  await page.waitForTimeout(400);
  await foto(page, "kabouter-op-zijn-kop");
  await page.reload();
  await page.getByRole("button", { name: "Verder spelen" }).click();
  await wachtTot(page, () => window.__kk.actief());
  assert.deepEqual(await page.evaluate(() => window.__kk.positie()), bewaard, "positie bewaard");
  t = await page.evaluate(() => window.__kk.toestand());
  assert.equal(t.held, "tobber");
  assert.ok(t.vlaggen.includes("streek_kabouter"));
  await ctx.close();
}

// ── Telefoon: betrapt worden en het andere einde ─────────────
{
  const { ctx, page } = await nieuweContext({ width: 390, height: 844 });
  await page.goto(URL_);
  await page.getByRole("button", { name: "Nieuw spel" }).click();
  await page.getByRole("button", { name: "Pim" }).click();
  await totWereld(page);
  await page.waitForTimeout(300);
  await foto(page, "telefoon-straat");
  await tikOp(page, "bel_toos");
  await page.locator("button.bel").waitFor({ timeout: 15000 });
  await page.locator("button.bel").click({ force: true });
  await page.getByRole("button", { name: /Blijf gewoon staan/ }).click();
  await page.locator("p.tekst", { hasText: "heel dapper" }).waitFor();
  await foto(page, "telefoon-betrapt");
  await totWereld(page);
  await tikOp(page, "slof");
  await page.locator(".splitsmoment").waitFor({ timeout: 20000 });
  await verderTot(page, async () => (await page.locator(".keuzes.splits").count()) > 0);
  await foto(page, "telefoon-splitsmoment");
  await page.getByRole("button", { name: /nog beter/ }).click();
  await verderTot(page, async () => (await page.locator(".einde").count()) > 0);
  await page.getByText("Betrapt door Oma Toos").first().waitFor();
  await foto(page, "telefoon-einde-betrapt");
  await ctx.close();
}

await browser.close();
await server.close();
assert.deepEqual(fouten, [], "geen fouten in de console");
console.log(`✔ Alle speelroutes gelukt. Screenshots in ${MAP}`);
