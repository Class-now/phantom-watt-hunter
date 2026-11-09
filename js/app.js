import { DEVICES, ROOMS, REGIONS, SOURCES, EXAMPLE, CUSTOM_ACTIONS } from "./data.js";
import { baselineKwh, actionSavings, summarize, toCost, toCo2, fmtNum, fmtMoney, fmtRange, wattsRange } from "./calc.js";

const KEY = "phantom-watt-hunter:v1";
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function freshState() {
  const r = REGIONS[0];
  return { step: 1, room: 0, region: r.id, currency: r.currency, price: r.price, co2: r.co2, adherence: 80, items: {}, custom: [], done: {} };
}

let state = load();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === "object") return { ...freshState(), ...s };
  } catch { /* ignore broken storage */ }
  return freshState();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep working without saving */ }
}

const region = () => {
  const base = REGIONS.find((r) => r.id === state.region) || REGIONS[0];
  return { ...base, currency: state.currency ?? base.currency };
};

function customDevices() {
  return state.custom.map((c) => ({ id: c.id, room: c.room, name: c.name, hint: "Added by you, using your own measured watts.", w: null, hours: 20, src: [], actions: CUSTOM_ACTIONS, custom: true }));
}
const allDevices = () => [...DEVICES, ...customDevices()];
const itemFor = (d) => (state.items[d.id] ||= { on: false, count: 1, hours: d.hours, measured: "", action: "" });

function rows() {
  return allDevices().filter((d) => state.items[d.id]?.on).map((d) => ({ device: d, item: state.items[d.id] }));
}
const sum = () => summarize(rows(), { adherence: state.adherence / 100, onlyDone: state.done });

// Text helpers
const kwhTxt = (r) => fmtRange(r, undefined, " kWh/yr");
const costTxt = (r) => fmtRange(toCost(r, state.price), (v) => fmtMoney(v, region()), "/yr");
const co2Txt = (r) => fmtRange(toCo2(r, state.co2), (v) => fmtNum(v, Math.abs(v) < 10 ? 1 : 0), " kg CO₂/yr");
const shortK = (r) => `${fmtNum(r[1])} kWh`;

// ---------- Navigation ----------
function go(step, focus = true) {
  state.step = step;
  save();
  for (let i = 1; i <= 4; i++) $(`#step-${i}`).hidden = i !== step;
  document.querySelectorAll(".steps button").forEach((b) => {
    if (Number(b.dataset.step) === step) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
  if (step === 2) renderRoom();
  if (step === 3) renderChoices();
  if (step === 4) renderPlan();
  renderTally();
  if (focus) {
    $(`#h-${step}`).focus();
    window.scrollTo(0, 0);
  }
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-go],[data-step]");
  if (b) go(Number(b.dataset.go || b.dataset.step));
});

// ---------- Step 1: setup ----------
function initSetup() {
  const sel = $("#region");
  sel.innerHTML = REGIONS.map((r) => `<option value="${r.id}">${esc(r.label)}</option>`).join("");
  sel.value = state.region;
  $("#currency").value = state.currency;
  $("#price").value = state.price;
  $("#co2").value = state.co2;
  showRegionSrc();
  sel.addEventListener("change", () => {
    const r = REGIONS.find((x) => x.id === sel.value);
    state.region = r.id;
    if (r.id !== "CUSTOM") {
      state.currency = r.currency;
      state.price = r.price;
      state.co2 = r.co2;
      $("#currency").value = r.currency;
      $("#price").value = r.price;
      $("#co2").value = r.co2;
    }
    showRegionSrc();
    save();
    renderTally();
  });
  for (const id of ["price", "co2"]) {
    $(`#${id}`).addEventListener("input", (e) => {
      const v = Number(e.target.value);
      if (v >= 0) { state[id] = v; save(); renderTally(); }
    });
  }
  $("#currency").addEventListener("input", (e) => { state.currency = e.target.value; save(); renderTally(); });
  $("#load-example").addEventListener("click", () => {
    const keepDone = {};
    state = { ...freshState(), items: structuredClone(EXAMPLE.items), done: keepDone };
    initSetupValues();
    go(4);
  });
  $("#reset-all").addEventListener("click", () => {
    if (!confirm("Clear all rooms, choices and ticks saved in this browser?")) return;
    state = freshState();
    save();
    initSetupValues();
    go(1);
  });
}
function initSetupValues() {
  $("#region").value = state.region;
  $("#currency").value = state.currency;
  $("#price").value = state.price;
  $("#co2").value = state.co2;
  showRegionSrc();
}
function showRegionSrc() {
  const r = REGIONS.find((x) => x.id === state.region);
  const s = r?.src && SOURCES[r.src];
  $("#region-src").textContent = s ? `Defaults: ${s.title}. ${s.note}` : "Enter the price and emission factor from your own bill or utility.";
}

// ---------- Running tally ----------
function renderTally() {
  const s = sum();
  const n = s.rows.length;
  const el = $("#tally");
  if (!n) { el.innerHTML = `<div class="wrap">No phantom loads logged yet.</div>`; return; }
  const planned = s.rows.some((r) => r.action);
  el.innerHTML = `<div class="wrap"><strong>${n}</strong> device${n > 1 ? "s" : ""} found · standby ≈ <strong>${fmtNum(s.before[1])} kWh/yr</strong> · ${fmtMoney(s.before[1] * state.price, region())}/yr${planned ? ` · plan saves ≈ <strong>${fmtNum(s.saved[1])} kWh/yr</strong>` : ""}</div>`;
}

// ---------- Step 2: rooms ----------
function estimateText(d, item) {
  const k = baselineKwh(d, item);
  const w = d.baselineKwh ? null : wattsRange(d, item);
  const wTxt = w ? (Number(item.measured) > 0 ? `${fmtNum(w[1], 1)} W measured` : `typically ${fmtNum(w[1], 1)} W (${fmtNum(w[0], w[0] < 1 ? 2 : 1)}–${fmtNum(w[2], 1)} W)`) : "always-on heater";
  return `${wTxt} → ${kwhTxt(k)} · ${costTxt(k)} · ${co2Txt(k)}`;
}

function deviceRow(d) {
  const it = itemFor(d);
  const id = d.id;
  const srcs = d.src.map((s) => `<a href="#src-${s}">${s}</a>`).join(", ");
  return `<div class="dev ${it.on ? "on" : ""}" data-dev="${esc(id)}">
    <div class="dev-head">
      <input type="checkbox" id="on-${esc(id)}" data-f="on" ${it.on ? "checked" : ""} aria-describedby="hint-${esc(id)}">
      <label for="on-${esc(id)}"><strong>${esc(d.name)}</strong></label>
      ${d.custom ? `<button type="button" class="ghost small" data-remove="${esc(id)}">Remove</button>` : ""}
    </div>
    <p class="hint" id="hint-${esc(id)}">${esc(d.hint)}${srcs ? ` <span class="src">Sources: ${srcs}</span>` : ""}</p>
    <div class="fields" ${it.on ? "" : "hidden"}>
      <div class="field small"><label for="n-${esc(id)}">How many</label><input id="n-${esc(id)}" data-f="count" type="number" min="1" max="20" step="1" inputmode="numeric" value="${esc(it.count)}"></div>
      ${d.baselineKwh ? "" : `<div class="field small"><label for="h-${esc(id)}">Hours per day in standby</label><input id="h-${esc(id)}" data-f="hours" type="number" min="0" max="24" step="0.5" inputmode="decimal" value="${esc(it.hours)}"></div>
      <div class="field small"><label for="m-${esc(id)}">Measured watts${d.custom ? "" : " (optional, from a plug meter)"}</label><input id="m-${esc(id)}" data-f="measured" type="number" min="0" step="0.1" inputmode="decimal" value="${esc(it.measured)}"></div>`}
      <p class="est" id="est-${esc(id)}">${esc(estimateText(d, it))}</p>
    </div>
  </div>`;
}

function renderRoom() {
  const i = Math.min(Math.max(0, state.room), ROOMS.length - 1);
  const room = ROOMS[i];
  const devs = allDevices().filter((d) => d.room === room.id);
  const last = i === ROOMS.length - 1;
  $("#room-pager").innerHTML = `
    <h2 id="room-h" tabindex="-1">Room ${i + 1} of ${ROOMS.length}: ${esc(room.name)}</h2>
    <p class="note">${esc(room.tip)} Tick what you have, then adjust the count and hours.</p>
    <div class="devs">${devs.map(deviceRow).join("")}</div>
    <details class="add-custom">
      <summary>Add a device that isn't listed (needs a measured wattage)</summary>
      <form id="custom-form" class="grid3">
        <div class="field"><label for="c-name">Device name</label><input id="c-name" required maxlength="60"></div>
        <div class="field"><label for="c-w">Measured standby watts</label><input id="c-w" type="number" min="0.01" step="0.01" required inputmode="decimal"></div>
        <div class="field"><label for="c-h">Hours per day in standby</label><input id="c-h" type="number" min="0" max="24" step="0.5" value="20" required inputmode="decimal"></div>
        <button type="submit">Add to ${esc(room.name)}</button>
      </form>
    </details>
    <div class="actions-row">
      ${i > 0 ? `<button type="button" data-room="${i - 1}">← ${esc(ROOMS[i - 1].name)}</button>` : `<button type="button" data-go="1">← Setup</button>`}
      ${last ? `<button type="button" class="primary" data-go="3">Pick actions →</button>` : `<button type="button" class="primary" data-room="${i + 1}">Next room: ${esc(ROOMS[i + 1].name)} →</button>`}
    </div>`;
}

$("#room-pager").addEventListener("click", (e) => {
  const b = e.target.closest("[data-room]");
  if (b) {
    state.room = Number(b.dataset.room);
    save();
    renderRoom();
    $("#room-h").focus();
    window.scrollTo(0, 0);
    return;
  }
  const rm = e.target.closest("[data-remove]");
  if (rm) {
    const id = rm.dataset.remove;
    state.custom = state.custom.filter((c) => c.id !== id);
    delete state.items[id];
    delete state.done[id];
    save();
    renderRoom();
    renderTally();
  }
});

$("#room-pager").addEventListener("input", (e) => {
  const f = e.target.dataset.f;
  const row = e.target.closest("[data-dev]");
  if (!f || !row) return;
  const d = allDevices().find((x) => x.id === row.dataset.dev);
  const it = itemFor(d);
  if (f === "on") {
    it.on = e.target.checked;
    row.classList.toggle("on", it.on);
    $(".fields", row).hidden = !it.on;
  } else if (f === "count") {
    it.count = Math.max(1, Math.min(20, Math.round(Number(e.target.value) || 1)));
  } else if (f === "hours") {
    const v = Number(e.target.value);
    if (e.target.value !== "" && v >= 0 && v <= 24) it.hours = v;
  } else if (f === "measured") {
    const v = Number(e.target.value);
    it.measured = e.target.value === "" || !(v >= 0) ? "" : v;
  }
  const est = $(".est", row);
  if (est) est.textContent = estimateText(d, it);
  save();
  renderTally();
});

$("#room-pager").addEventListener("submit", (e) => {
  if (e.target.id !== "custom-form") return;
  e.preventDefault();
  const name = $("#c-name").value.trim();
  const w = Number($("#c-w").value);
  const h = Number($("#c-h").value);
  if (!name || !(w > 0) || !(h >= 0 && h <= 24)) return;
  const id = `custom-${Date.now().toString(36)}`;
  state.custom.push({ id, name, room: ROOMS[state.room].id });
  state.items[id] = { on: true, count: 1, hours: h, measured: w, action: "" };
  save();
  renderRoom();
  renderTally();
  $(`#on-${id}`)?.focus();
});

// ---------- Step 3: choose actions ----------
function renderChoices() {
  $("#adherence").value = state.adherence;
  $("#adh-val").textContent = `${state.adherence}%`;
  const rs = rows();
  if (!rs.length) {
    $("#choices").innerHTML = `<p class="note">You haven't ticked any devices yet. <button type="button" data-go="2">Go back to the rooms</button> or <button type="button" id="ex2">load the example dorm room</button>.</p>`;
    $("#ex2").addEventListener("click", () => $("#load-example").click());
    return;
  }
  $("#choices").innerHTML = rs.map(({ device: d, item: it }) => {
    const base = baselineKwh(d, it);
    const opts = [{ id: "", label: "Keep as is" }, ...d.actions].map((a) => {
      const s = a.id ? actionSavings(d, it, a, state.adherence / 100) : [0, 0, 0];
      const neg = a.id && s[1] <= 0;
      const tag = a.id ? `<span class="save ${neg ? "neg" : ""}">${neg ? "Uses more than it saves: " : "Saves ≈ "}${fmtNum(Math.abs(s[1]))} kWh/yr · ${fmtMoney(Math.abs(s[1]) * state.price, region())}/yr${a.manual ? " (manual habit)" : ""}</span>` : "";
      const rid = `a-${d.id}-${a.id || "none"}`;
      return `<div class="opt"><input type="radio" name="act-${esc(d.id)}" id="${esc(rid)}" value="${esc(a.id)}" ${it.action === a.id ? "checked" : ""}><label for="${esc(rid)}">${esc(a.label)} ${tag}</label></div>`;
    }).join("");
    return `<fieldset class="choice" data-dev="${esc(d.id)}">
      <legend>${esc(d.name)}${it.count > 1 ? ` × ${it.count}` : ""}</legend>
      <p class="est">Now: ${esc(kwhTxt(base))} · ${esc(costTxt(base))}</p>
      ${opts}
    </fieldset>`;
  }).join("");
}

$("#choices").addEventListener("change", (e) => {
  const fs = e.target.closest("[data-dev]");
  if (!fs || e.target.type !== "radio") return;
  state.items[fs.dataset.dev].action = e.target.value;
  delete state.done[fs.dataset.dev];
  save();
  renderTally();
});
$("#adherence").addEventListener("input", (e) => {
  state.adherence = Number(e.target.value);
  save();
  $("#adh-val").textContent = `${state.adherence}%`;
  // Re-render labels but keep focus on the slider.
  renderChoices();
  renderTally();
});

// ---------- Step 4: plan ----------
function bar(label, r, max, cls) {
  const pct = max > 0 ? Math.max(1, (r[1] / max) * 100) : 0;
  const lo = max > 0 ? (Math.min(r[0], r[2]) / max) * 100 : 0;
  const hi = max > 0 ? (Math.max(r[0], r[2]) / max) * 100 : 0;
  return `<div class="bar-row"><span class="bar-label">${label}</span><span class="bar-track" aria-hidden="true"><span class="bar ${cls}" style="width:${pct.toFixed(1)}%"></span><span class="whisker" style="left:${lo.toFixed(1)}%;width:${Math.max(0.5, hi - lo).toFixed(1)}%"></span></span><span class="bar-val">${fmtNum(r[1])} kWh/yr</span></div>`;
}

function renderPlan() {
  const s = sum();
  const reg = region();
  if (!s.rows.length) {
    $("#plan").innerHTML = `<p class="note">No devices yet. <button type="button" data-go="2">Start the hunt</button> or <button type="button" id="ex3">load the example dorm room</button>.</p>`;
    $("#ex3").addEventListener("click", () => $("#load-example").click());
    return;
  }
  const acts = s.rows.filter((r) => r.action);
  const max = Math.max(s.before[2], 1);
  const doneN = acts.filter((r) => state.done[r.device.id]).length;
  const card = (title, r, cls) => `<div class="card ${cls}"><h3>${title}</h3>
    <p class="big">${fmtNum(r[1])} <small>kWh/yr</small></p>
    <p>${fmtMoney(r[1] * state.price, reg)}/yr · ${fmtNum(r[1] * state.co2, r[1] * state.co2 < 10 ? 1 : 0)} kg CO₂/yr</p>
    <p class="range">Range ${fmtNum(Math.min(r[0], r[2]))}–${fmtNum(Math.max(r[0], r[2]))} kWh/yr</p></div>`;
  const byRoom = ROOMS.map((room) => {
    const list = acts.filter((r) => r.device.room === room.id);
    if (!list.length) return "";
    return `<h3>${esc(room.name)}</h3><ul class="checklist">${list.map((r) => {
      const id = r.device.id;
      const neg = r.saved[1] <= 0;
      return `<li class="${state.done[id] ? "done" : ""}"><input type="checkbox" id="done-${esc(id)}" data-done="${esc(id)}" ${state.done[id] ? "checked" : ""}>
        <label for="done-${esc(id)}"><span class="box" aria-hidden="true"></span><strong>${esc(r.device.name)}${r.item.count > 1 ? ` × ${r.item.count}` : ""}:</strong> ${esc(r.action.label)}
        <span class="save ${neg ? "neg" : ""}">${neg ? "Net loss: " : ""}${esc(kwhTxt(r.saved))} · ${esc(costTxt(r.saved))} · ${esc(co2Txt(r.saved))}</span></label></li>`;
    }).join("")}</ul>`;
  }).join("");
  const kept = s.rows.filter((r) => !r.action);
  $("#plan").innerHTML = `
    <p class="lead">Settings: ${esc(reg.label)}, ${fmtMoney(state.price, { ...reg, decimals: Math.max(reg.decimals, 2) })}/kWh, ${state.co2} kg CO₂/kWh, manual follow-through ${state.adherence}%.</p>
    <div class="cards">
      ${card("Before", s.before, "before")}
      ${card("After your plan", s.after, "after")}
      ${card("Saved per year", s.saved, "saved")}
    </div>
    <div class="bars" role="img" aria-label="Standby energy before: about ${fmtNum(s.before[1])} kWh per year; after: about ${fmtNum(s.after[1])} kWh per year. Thin lines show the uncertainty range.">
      ${bar("Before", s.before, max, "before")}
      ${bar("After", s.after, max, "after")}
    </div>
    <h2>Checklist</h2>
    <p class="progress" role="status" aria-live="polite" id="done-status">${doneN} of ${acts.length} actions done · locked in ≈ <strong>${fmtNum(s.done[1])} kWh/yr</strong> (${fmtMoney(s.done[1] * state.price, reg)}, ${fmtNum(s.done[1] * state.co2, 1)} kg CO₂ per year)</p>
    ${acts.length ? byRoom : `<p class="note">No actions picked yet. <button type="button" data-go="3">Pick actions</button></p>`}
    ${kept.length ? `<h3>Kept as is</h3><p class="note">${kept.map((r) => esc(r.device.name)).join(", ")} — still ≈ ${fmtNum(kept.reduce((a, r) => a + r.base[1], 0))} kWh/yr.</p>` : ""}
    <p class="note small">Before/after counts only the standby and keep-warm loads you logged, not your whole bill. Ranges combine low/high device estimates; your real result depends on your models — a plug meter settles it.</p>`;
}

$("#plan").addEventListener("change", (e) => {
  const id = e.target.dataset.done;
  if (!id) return;
  if (e.target.checked) state.done[id] = new Date().toISOString().slice(0, 10);
  else delete state.done[id];
  save();
  renderPlan();
  $(`#done-${CSS.escape(id)}`)?.focus();
});

// ---------- Export ----------
function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

$("#dl-csv").addEventListener("click", () => {
  const s = sum();
  const head = ["room", "device", "count", "hours_per_day", "measured_w", "before_kwh_typ", "before_kwh_low", "before_kwh_high", "action", "manual", "saved_kwh_typ", "saved_kwh_low", "saved_kwh_high", "saved_cost_typ", "saved_kg_co2_typ", "done"];
  const lines = s.rows.map((r) => [
    ROOMS.find((x) => x.id === r.device.room)?.name, r.device.name, r.item.count, r.device.baselineKwh ? "" : r.item.hours, r.item.measured ?? "",
    r.base[1].toFixed(2), r.base[0].toFixed(2), r.base[2].toFixed(2), r.action?.label ?? "keep as is", r.action ? (r.action.manual ? "yes" : "no") : "",
    r.saved[1].toFixed(2), Math.min(r.saved[0], r.saved[2]).toFixed(2), Math.max(r.saved[0], r.saved[2]).toFixed(2),
    (r.saved[1] * state.price).toFixed(2), (r.saved[1] * state.co2).toFixed(2), state.done[r.device.id] || "",
  ].map(csvCell).join(","));
  download("phantom-watt-plan.csv", [head.join(","), ...lines].join("\r\n"), "text/csv");
});

function textChecklist() {
  const s = sum();
  const reg = region();
  const out = ["PHANTOM WATT HUNTER — my plan", `Price ${state.price}/kWh (${reg.currency || "currency"}), grid ${state.co2} kg CO2/kWh, follow-through ${state.adherence}%`, "",
    `Before: ${kwhTxt(s.before)} | ${costTxt(s.before)} | ${co2Txt(s.before)}`,
    `After:  ${kwhTxt(s.after)}`,
    `Saved:  ${kwhTxt(s.saved)} | ${costTxt(s.saved)} | ${co2Txt(s.saved)}`, ""];
  for (const room of ROOMS) {
    const list = s.rows.filter((r) => r.action && r.device.room === room.id);
    if (!list.length) continue;
    out.push(room.name.toUpperCase());
    for (const r of list) out.push(`[${state.done[r.device.id] ? "x" : " "}] ${r.device.name}: ${r.action.label} — saves ${shortK(r.saved)}/yr`);
    out.push("");
  }
  out.push("Estimates use typical published standby values (LBNL, ENERGY STAR, EU Ecodesign, ANRE Japan); see the app's Sources section.");
  return out.join("\r\n");
}
$("#dl-txt").addEventListener("click", () => download("phantom-watt-checklist.txt", textChecklist(), "text/plain"));
$("#print").addEventListener("click", () => window.print());

// ---------- Sources ----------
function renderSources() {
  $("#source-list").innerHTML = Object.entries(SOURCES).map(([k, s]) => `<li id="src-${k}"><strong>[${k}]</strong> ${esc(s.title)}. ${esc(s.note)} <a href="${esc(s.url)}" rel="noopener">${esc(s.url)}</a></li>`).join("");
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#src-"]');
  if (a) $(".sources details").open = true;
});

initSetup();
renderSources();
go(state.step || 1, false);
