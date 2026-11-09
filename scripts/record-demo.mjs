// Records the demo video headless with Playwright and converts it to H.264 mp4 with ffmpeg.
// Usage: node scripts/record-demo.mjs [base-url]   → submission/demo.mp4 + submission/transcript.md
import { mkdirSync, readdirSync, renameSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

let base = process.argv[2];
let server;
if (!base) { server = await serve(8734); base = "http://127.0.0.1:8734/"; }
const out = "demo-out";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: out, size: { width: 1280, height: 720 } } });
const page = await context.newPage();
const t0 = Date.now();
const lines = [];
const pause = (ms) => page.waitForTimeout(ms);

async function caption(text) {
  lines.push({ t: (Date.now() - t0) / 1000, text });
  await page.evaluate((t) => {
    let c = document.getElementById("demo-caption");
    if (!c) {
      c = document.createElement("div");
      c.id = "demo-caption";
      c.setAttribute("aria-hidden", "true");
      c.style.cssText = "position:fixed;left:50%;bottom:20px;transform:translateX(-50%);width:max-content;max-width:1160px;background:rgba(10,30,20,.93);color:#fff;font:600 22px/1.35 system-ui,'Segoe UI',sans-serif;padding:12px 22px;border-radius:12px;z-index:99999;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.3)";
      document.body.appendChild(c);
    }
    c.textContent = t;
  }, text);
}
async function show(selector, block = "center") {
  await page.locator(selector).first().evaluate((n, b) => n.scrollIntoView({ behavior: "smooth", block: b }), block);
  await pause(700);
}

await page.goto(base);
await page.evaluate(() => localStorage.clear());
await page.reload();
await caption("Phantom Watt Hunter: find the power your room burns while everything is 'off'.");
await pause(4500);
await show("#region");
await caption("Japan by default: ¥31/kWh and 0.44 kg CO₂/kWh. Switch region or type the numbers from your own bill.");
await pause(5500);

await page.getByRole("button", { name: "Start the hunt →" }).click();
await pause(600);
await caption("Room by room, tick what's plugged in. Each device starts from cited typical standby watts.");
await page.getByLabel("Laptop charger left plugged in").check();
await pause(900);
await page.getByLabel("Phone charger with no phone").check();
await page.locator("#n-phone-charger").fill("2");
await pause(1200);
await page.getByLabel("Computer monitor (standby)").check();
await pause(800);
await page.getByLabel("Powered speakers / subwoofer / amp").check();
await pause(1500);
await page.getByLabel("Game console in rest / instant-on mode").check();
await show("[data-dev='console']");
await caption("Every number is a range: a console in rest mode is ~8 W, but anywhere from 1 to 15 W.");
await pause(5500);
await page.locator("#m-console").pressSequentially("9.2", { delay: 150 });
await caption("Have a plug-in meter? Enter the real reading and the range shrinks to the meter's ±10%.");
await pause(5500);

await page.getByRole("button", { name: /Next room: TV/ }).click();
await pause(500);
await page.getByLabel("TV in standby").check();
await caption("TVs with 'quick start' turned on can sit at 10 W or more instead of 0.5 W.");
await pause(4000);
await page.getByRole("button", { name: /Next room: Kitchen/ }).click();
await pause(500);
await page.getByLabel("Rice cooker on keep-warm (保温)").check();
await show("[data-dev='rice-cooker']");
await caption("Keep-warm heaters are the big hitters: rice kept warm 7 h a day ≈ 46 kWh a year (ANRE Japan).");
await pause(5500);
await page.getByRole("button", { name: /Next room: Bathroom/ }).click();
await pause(500);
await page.getByLabel("Heated toilet seat / bidet (温水洗浄便座)").check();
await show("[data-dev='toilet-seat']");
await caption("A heated toilet seat warms itself 24/7 — standard in Japanese apartments.");
await pause(4500);

await page.getByRole("button", { name: "Pick actions →" }).click();
await pause(500);
await caption("Now pick one fix per device. Manual habits are scaled by how often you'll really remember.");
await page.locator("#adherence").fill("70");
await page.locator("#adherence").dispatchEvent("input");
await pause(4500);
await page.locator('fieldset:has-text("Phone charger") >> role=radio[name=/Smart plug/]').check();
await show('fieldset:has-text("Phone charger")');
await caption("Honest both ways: a smart plug on a phone charger uses more power than it saves.");
await pause(5500);
await page.locator('fieldset:has-text("Phone charger") >> role=radio[name=/Unplug/]').check();
await page.locator('fieldset:has-text("Laptop charger") >> role=radio[name=/Unplug/]').check();
await page.locator('fieldset:has-text("Computer monitor") >> role=radio[name=/power strip/]').check();
await page.locator('fieldset:has-text("Powered speakers") >> role=radio[name=/power strip/]').check();
await page.locator('fieldset:has-text("Game console") >> role=radio[name=/energy-saving/]').check();
await show('fieldset:has-text("Game console")');
await caption("Settings changes, like a console's energy-saving mode, keep working without willpower.");
await pause(4500);
await page.locator('fieldset:has-text("TV in standby") >> role=radio[name=/quick-start/]').check();
await page.locator('fieldset:has-text("Rice cooker") >> role=radio[name=/keep warm/]').check();
await page.locator('fieldset:has-text("Heated toilet seat") >> role=radio[name=/^Both/]').check();
await show('fieldset:has-text("Heated toilet seat")');
await pause(2000);

await page.getByRole("button", { name: "See my plan →" }).click();
await pause(600);
await caption("Your plan: before vs after in kWh, money and CO₂ per year, with the uncertainty range shown.");
await pause(6000);
await show("#done-status", "start");
await page.evaluate(() => window.scrollBy(0, -80));
await caption("Tick actions as you do them. Progress stays in your browser: no account, nothing uploaded.");
await pause(1000);
await page.locator("#done-console").check();
await pause(1200);
await page.locator("#done-rice-cooker").check();
await pause(1200);
await page.locator("#done-tv").check();
await pause(3000);
await page.emulateMedia({ media: "print" });
await page.evaluate(() => window.scrollTo(0, 0));
await caption("Print a checklist for your wall, or export CSV / text to track it in a spreadsheet.");
await pause(5500);
await page.emulateMedia({ media: "screen" });

await page.getByRole("button", { name: "1. Setup" }).click();
await pause(500);
await page.getByRole("button", { name: /Load an example dorm room/ }).click();
await pause(600);
await caption("Example 1R dorm room: ≈402 → ≈219 kWh a year. Saves ≈¥5,700 and ≈80 kg CO₂ (range 74–410 kWh).");
await pause(7000);
await caption("Small watts × 8,760 hours a year. Hunt yours at class-now.github.io/phantom-watt-hunter");
await pause(5000);

const total = (Date.now() - t0) / 1000;
await context.close();
await browser.close();
server?.close();
const vid = readdirSync(out).find((f) => f.endsWith(".webm") && f !== "raw.webm");
if (vid) renameSync(join(out, vid), join(out, "raw.webm"));
mkdirSync("submission", { recursive: true });
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(out, "raw.webm"), "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-movflags", "+faststart", "-an", "submission/demo.mp4"], { stdio: "inherit" });
const fmt = (t) => `${String(Math.floor(t / 60)).padStart(1, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
writeFileSync("submission/transcript.md", `# Demo video transcript — Phantom Watt Hunter\n\nNo audio; these captions are burned into the video (on-screen subtitle band). Timestamps are approximate (±5 s).\n\n${lines.map((l) => `- **${fmt(l.t)}** ${l.text}`).join("\n")}\n`);
console.log("recorded", total.toFixed(1), "s; mp4", (statSync("submission/demo.mp4").size / 1e6).toFixed(2), "MB");
