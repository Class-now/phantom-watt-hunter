// Pure calculation helpers (no DOM). Every result is a range: [low, typical, high].
import { PLUG_W } from "./data.js";

const YEAR_H = 365;
const METER_TOL = 0.1; // a cheap plug-in meter is roughly ±10% at low watts

export const r3 = (f) => [f(0), f(1), f(2)];

// Watts for a device: measured value (±10%) wins over the library range.
export function wattsRange(device, item) {
  const m = Number(item?.measured);
  if (m > 0) return [m * (1 - METER_TOL), m, m * (1 + METER_TOL)];
  return device.w ? [...device.w] : [0, 0, 0];
}

export function baselineKwh(device, item) {
  const n = Math.max(0, Number(item?.count ?? 1));
  if (device.baselineKwh) return device.baselineKwh.map((v) => v * n);
  const h = clampHours(item?.hours ?? device.hours);
  const w = wattsRange(device, item);
  return w.map((x) => (x * h * YEAR_H * n) / 1000);
}

export function clampHours(h) {
  const x = Number(h);
  if (!Number.isFinite(x)) return 0;
  return Math.min(24, Math.max(0, x));
}

// Savings in kWh/yr for one action. Low end pairs low savings with high overhead (conservative).
export function actionSavings(device, item, action, adherence = 1) {
  if (!action) return [0, 0, 0];
  const n = Math.max(0, Number(item?.count ?? 1));
  const adh = action.manual ? adherence : 1;
  const base = baselineKwh(device, item);
  if (action.kind === "kwh") return action.kwh.map((v) => v * n * adh);
  if (action.kind === "cut") {
    const plugK = action.plug ? PLUG_W.map((p) => (p * 24 * YEAR_H * n) / 1000) : [0, 0, 0];
    return [base[0] * action.frac * adh - plugK[2], base[1] * action.frac * adh - plugK[1], base[2] * action.frac * adh - plugK[0]];
  }
  if (action.kind === "reduce") {
    const h = clampHours(item?.hours ?? device.hours);
    const w = wattsRange(device, item);
    const k = (h * YEAR_H * n * action.frac * adh) / 1000;
    return [Math.max(0, w[0] - action.to[2]) * k, Math.max(0, w[1] - action.to[1]) * k, Math.max(0, w[2] - action.to[0]) * k];
  }
  return [0, 0, 0];
}

export const toCost = (kwh, price) => kwh.map((v) => v * price);
export const toCo2 = (kwh, factor) => kwh.map((v) => v * factor);
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const ZERO = [0, 0, 0];

// Summarise a whole home. devices: list of {device, item}. Returns totals and per-row results.
export function summarize(rows, { adherence = 0.8, onlyDone = null } = {}) {
  let before = ZERO;
  let saved = ZERO;
  let done = ZERO;
  const out = rows.map(({ device, item }) => {
    const base = baselineKwh(device, item);
    const action = device.actions.find((a) => a.id === item.action);
    const s = actionSavings(device, item, action, adherence);
    before = add(before, base);
    saved = add(saved, s);
    if (onlyDone && onlyDone[device.id] && action) done = add(done, s);
    return { device, item, action, base, saved: s };
  });
  const after = before.map((b, i) => Math.max(0, b - saved[i]));
  return { rows: out, before, saved, after, done };
}

export function fmtNum(v, digits) {
  const d = digits ?? (Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 0 : 1);
  return Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtMoney(v, region) {
  const d = Math.abs(v) >= 100 && region.decimals > 0 ? 0 : region.decimals;
  const s = fmtNum(Math.abs(v), d);
  return `${v < 0 ? "−" : ""}${region.currency}${s}`;
}

// "≈ 42 kWh/yr (18–95)"
export function fmtRange(r, f = (v) => fmtNum(v), unit = "") {
  const lo = Math.min(r[0], r[2]);
  const hi = Math.max(r[0], r[2]);
  if (Math.abs(hi - lo) < 1e-9) return `≈ ${f(r[1])}${unit}`;
  return `≈ ${f(r[1])}${unit} (${f(lo)}–${f(hi)})`;
}
