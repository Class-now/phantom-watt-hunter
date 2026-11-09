// Headless end-to-end check. Usage: node scripts/smoke.mjs [base-url]
// Without a URL it starts the local static server.
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

let base = process.argv[2];
let server;
if (!base) { server = await serve(8732); base = "http://127.0.0.1:8732/"; }

const fail = (m) => { console.error("FAIL:", m); process.exitCode = 1; };
const ok = (m) => console.log("ok -", m);
const browser = await chromium.launch({ headless: true });

async function run(viewport, label) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const outside = [];
  page.on("request", (r) => { if (!r.url().startsWith(base) && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) outside.push(r.url()); });

  const resp = await page.goto(base);
  if (resp.status() !== 200) fail(`${label}: status ${resp.status()}`); else ok(`${label}: 200`);
  await page.getByRole("button", { name: "Start the hunt →" }).click();
  await page.getByLabel("Laptop charger left plugged in").check();
  await page.locator("#m-laptop-charger").fill("1.5");
  const est = await page.locator("#est-laptop-charger").textContent();
  if (!/1\.5 W measured/.test(est) || !/7\.7 kWh\/yr \(6\.9–8\.4\)/.test(est)) fail(`${label}: estimate text ${est}`); else ok(`${label}: measured watts → ${est}`);
  await page.getByLabel("Game console in rest / instant-on mode").check();
  await page.getByRole("button", { name: /Next room: TV/ }).click();
  await page.getByLabel("TV in standby").check();
  await page.getByRole("button", { name: /Next room: Kitchen/ }).click();
  await page.getByLabel("Rice cooker on keep-warm (保温)").check();
  await page.getByRole("button", { name: /Next room: Bathroom/ }).click();
  await page.getByText("Add a device that isn't listed").click();
  await page.getByLabel("Device name").fill("Hair straightener stand");
  await page.getByLabel("Measured standby watts").fill("0.8");
  await page.getByRole("button", { name: /Add to Bathroom/ }).click();
  await page.getByRole("button", { name: "Pick actions →" }).click();
  const tally = await page.locator("#tally").textContent();
  if (!/5 devices found/.test(tally)) fail(`${label}: tally ${tally}`); else ok(`${label}: tally ${tally.trim()}`);
  await page.getByRole("radio", { name: /Switch to energy-saving/ }).check();
  await page.getByRole("radio", { name: /Don't keep warm/ }).check();
  await page.locator('fieldset:has-text("Hair straightener") >> role=radio[name=/Unplug it when not in use/]').check();
  await page.locator('fieldset:has-text("Laptop charger") >> role=radio[name=/Smart plug/]').check();
  await page.getByRole("button", { name: "See my plan →" }).click();
  const cards = await page.locator(".cards").textContent();
  if (!/Before/.test(cards) || !/Saved per year/.test(cards) || !/¥/.test(cards)) fail(`${label}: cards ${cards}`); else ok(`${label}: plan cards rendered`);
  await page.getByLabel(/Game console in rest/).check();
  const prog = await page.locator("#done-status").textContent();
  if (!/1 of 4 actions done/.test(prog)) fail(`${label}: progress ${prog}`); else ok(`${label}: ${prog.trim()}`);
  await page.reload();
  const prog2 = await page.locator("#done-status").textContent();
  if (prog2 !== prog) fail(`${label}: not persisted (${prog2})`); else ok(`${label}: progress survives reload (localStorage)`);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download CSV" }).click()]);
  const csv = await (await dl.createReadStream()).toArray();
  const text = Buffer.concat(csv).toString("utf8");
  if (text.split("\r\n").length !== 6) fail(`${label}: csv lines ${text.split("\r\n").length}`); else ok(`${label}: CSV has header + 5 rows`);
  const [dl2] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download text checklist" }).click()]);
  const t2 = Buffer.concat(await (await dl2.createReadStream()).toArray()).toString("utf8");
  if (!/\[x\] Game console/.test(t2)) fail(`${label}: txt ${t2}`); else ok(`${label}: text checklist marks done item`);
  await page.emulateMedia({ media: "print" });
  const navHidden = await page.locator("nav.steps").isHidden();
  const planVisible = await page.locator("#plan").isVisible();
  if (!navHidden || !planVisible) fail(`${label}: print layout`); else ok(`${label}: print layout shows only the plan`);
  await page.emulateMedia({ media: "screen" });
  // Region switch changes currency.
  await page.getByRole("button", { name: "1. Setup" }).click();
  await page.getByLabel(/Region/).selectOption("US");
  await page.getByRole("button", { name: "4. Plan & track" }).click();
  if (!/\$/.test(await page.locator(".cards").textContent())) fail(`${label}: region switch`); else ok(`${label}: US region → $`);
  // Example room.
  await page.getByRole("button", { name: "1. Setup" }).click();
  await page.getByRole("button", { name: /Load an example dorm room/ }).click();
  const ex = await page.locator(".card.before .big").textContent();
  ok(`${label}: example dorm before = ${ex.trim()}`);
  // Keyboard: steps reachable.
  await page.keyboard.press("Tab");
  if (errors.length) fail(`${label}: console errors ${errors.join(" | ")}`); else ok(`${label}: no console errors`);
  if (outside.length) fail(`${label}: external requests ${outside.join(", ")}`); else ok(`${label}: no external requests`);
  await context.close();
}

await run({ width: 1280, height: 800 }, "desktop");
await run({ width: 360, height: 740 }, "mobile");
await browser.close();
server?.close();
console.log(process.exitCode ? "SMOKE FAILED" : "SMOKE PASSED");
