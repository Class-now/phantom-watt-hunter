import test from "node:test";
import assert from "node:assert/strict";
import { DEVICES, EXAMPLE } from "../js/data.js";
import { baselineKwh, actionSavings, summarize, fmtRange } from "../js/calc.js";

const dev = (id) => DEVICES.find((d) => d.id === id);
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("baseline: watts x hours x 365 / 1000 x count", () => {
  const k = baselineKwh(dev("console"), { count: 1, hours: 20 });
  near(k[1], (8 * 20 * 365) / 1000);
  near(k[0], (1 * 20 * 365) / 1000);
  near(k[2], (15 * 20 * 365) / 1000);
});

test("measured watts replace the library range with +-10%", () => {
  const k = baselineKwh(dev("tv"), { count: 1, hours: 20, measured: 10 });
  near(k[1], 73);
  near(k[0], 73 * 0.9);
  near(k[2], 73 * 1.1);
});

test("manual actions are scaled by follow-through, settings are not", () => {
  const it = { count: 1, hours: 20, action: "" };
  const strip = dev("console").actions.find((a) => a.id === "strip");
  const eco = dev("console").actions.find((a) => a.id === "eco");
  near(actionSavings(dev("console"), it, strip, 0.5)[1], 58.4 * 0.5);
  near(actionSavings(dev("console"), it, eco, 0.5)[1], ((8 - 0.5) * 20 * 365) / 1000);
});

test("a smart plug on a phone charger costs more than it saves", () => {
  const smart = dev("phone-charger").actions.find((a) => a.id === "smart");
  const s = actionSavings(dev("phone-charger"), { count: 1, hours: 18 }, smart, 1);
  assert.ok(s[1] < 0);
});

test("ANRE fixed-kWh actions", () => {
  const lid = dev("toilet-seat").actions.find((a) => a.id === "lid");
  near(actionSavings(dev("toilet-seat"), { count: 1 }, lid, 1)[1], 34.9);
});

test("example dorm room: after < before and ranges ordered", () => {
  const rows = Object.entries(EXAMPLE.items).map(([id, item]) => ({ device: dev(id), item }));
  const s = summarize(rows, { adherence: 0.8 });
  assert.ok(s.after[1] < s.before[1]);
  assert.ok(s.before[0] <= s.before[1] && s.before[1] <= s.before[2]);
  console.log("example before", s.before.map((v) => v.toFixed(1)).join(" / "), "saved", s.saved.map((v) => v.toFixed(1)).join(" / "), "after", s.after.map((v) => v.toFixed(1)).join(" / "));
  for (const r of s.rows) console.log(" ", r.device.id, "base", r.base[1].toFixed(1), "saved", r.saved.map((v) => v.toFixed(1)).join("/"));
});

test("fmtRange", () => {
  assert.equal(fmtRange([1, 2, 3], undefined, " kWh/yr"), "≈ 2.0 kWh/yr (1.0–3.0)");
});
