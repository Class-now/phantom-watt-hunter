// Screenshots (1280x800) and thumbnail (1200x800) into submission/. Usage: node scripts/shots.mjs [base-url]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

let base = process.argv[2];
let server;
if (!base) { server = await serve(8733); base = "http://127.0.0.1:8733/"; }
mkdirSync("submission/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(base);
await page.getByRole("button", { name: /Load an example dorm room/ }).click();

// 1: hunting the desk room
await page.getByRole("button", { name: "2. Hunt room by room" }).click();
await page.getByRole("button", { name: /← Setup|Desk/ }).first().waitFor();
await page.locator("#tally").evaluate((n) => n.scrollIntoView());
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "submission/screenshots/1-hunt-room.png" });

// 2: choosing actions
await page.getByRole("button", { name: "3. Pick actions" }).click();
await page.locator('fieldset:has-text("Game console")').evaluate((n) => n.scrollIntoView({ block: "start" }));
await page.evaluate(() => window.scrollBy(0, -60));
await page.screenshot({ path: "submission/screenshots/2-pick-actions.png" });

// 3: plan with a couple of ticks
await page.getByRole("button", { name: "4. Plan & track" }).click();
await page.locator("#done-console").check();
await page.locator("#done-rice-cooker").check();
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "submission/screenshots/3-plan-and-track.png" });

// Thumbnail 1200x800: plan cards with a title band.
await page.setViewportSize({ width: 1200, height: 800 });
await page.evaluate(() => {
  document.querySelector(".tally").style.display = "none";
  document.querySelector(".steps").style.display = "none";
  document.querySelector(".site-head").style.display = "none";
  document.querySelector("main").style.paddingTop = "48px";
  const h = document.querySelector("#h-4");
  h.innerHTML = "Phantom Watt Hunter<br><span style='font-size:1.3rem;font-weight:600;color:#165d3a'>Find standby power room by room → a measurable kWh · ¥ · CO₂ plan</span>";
  h.style.fontSize = "2.6rem";
  document.querySelector("#plan .lead").style.display = "none";
});
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "submission/thumb.png" });

await browser.close();
server?.close();
console.log("screenshots written");
