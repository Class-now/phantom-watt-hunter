// Phantom Watt Hunter — device library, regions and sources.
// All figures are approximate and rounded from the cited public sources; ranges are deliberate.
// w: [low, typical, high] standby/idle watts. hours: default hours per day the device sits in that state.

export const SOURCES = {
  LBNL: {
    title: 'Lawrence Berkeley National Laboratory (LBNL), "Standby Power" project and summary table of measured standby by product',
    url: "https://standby.lbl.gov/",
    note: "Measured standby of hundreds of products. Older or always-connected devices often draw several watts; set-top boxes, game consoles and powered speakers are among the highest.",
  },
  ESTAR: {
    title: "ENERGY STAR product specifications (TVs, computers, displays, audio/video)",
    url: "https://www.energystar.gov/products",
    note: "Certified products must meet low sleep/off limits, typically well under 1 W for TVs and displays and a few watts for computers in sleep.",
  },
  EU: {
    title: "EU Ecodesign standby rules: Regulation (EC) 1275/2008, replaced by Regulation (EU) 2023/826",
    url: "https://eur-lex.europa.eu/eli/reg/2023/826/oj",
    note: "New products must stay at about 0.5 W or less in off/standby; networked standby has limits of a few watts. Older devices predate these limits.",
  },
  IEA: {
    title: 'International Energy Agency (2001), "Things that go Blip in the Night", and the One Watt Initiative',
    url: "https://www.iea.org/reports/things-that-go-blip-in-the-night",
    note: "Estimated standby at roughly 5–15% of household electricity in member countries around 2000; proposed a 1 W target per device.",
  },
  DOE: {
    title: 'U.S. Department of Energy, Energy Saver: "Reducing Electricity Use and Costs" (standby / vampire loads)',
    url: "https://www.energy.gov/energysaver/reducing-electricity-use-and-costs",
    note: "Standby loads can account for roughly 5–10% of residential electricity use.",
  },
  ANRE: {
    title: "Agency for Natural Resources and Energy, Japan (資源エネルギー庁), Energy Saving Portal: household energy-saving guide (家庭の省エネ徹底ガイド)",
    url: "https://www.enecho.meti.go.jp/category/saving_and_new/saving/general/howto/",
    note: "Per-action savings for Japanese homes, e.g. closing the heated toilet seat lid ≈34.9 kWh/yr, seat temperature one step lower ≈26.4 kWh/yr, wash-water temperature one step lower ≈13.8 kWh/yr, unplugging an electric hot-water pot when unused for long periods ≈107 kWh/yr, not keeping rice warm for 7 h ≈46 kWh/yr. Japan's household standby survey (FY2012) put standby at about 5% of household electricity.",
  },
  PLUG: {
    title: "Smart plug / smart strip self-consumption (manufacturer spec sheets and independent tests)",
    url: "https://standby.lbl.gov/",
    note: "A Wi-Fi smart plug typically draws about 0.3–1 W itself, 24 hours a day. On tiny loads it can use more than it saves.",
  },
  JP: {
    title: "Japan: 全国家庭電気製品公正取引協議会 reference electricity price 31 ¥/kWh (2022); Ministry of the Environment utility emission factors (national average roughly 0.43–0.45 kg-CO2/kWh)",
    url: "https://ghg-santeikohyo.env.go.jp/calc",
    note: "Your utility's factor and your actual unit price can differ. Check your bill (検針票).",
  },
  US: {
    title: "United States: EIA average residential price (~$0.17/kWh, 2024); EPA eGRID national average (~0.37 kg-CO2/kWh)",
    url: "https://www.epa.gov/egrid",
    note: "State and utility values vary a lot (hydro-heavy grids are far cleaner).",
  },
  UK: {
    title: "United Kingdom: Ofgem price cap (~£0.25/kWh, 2025); DESNZ greenhouse gas conversion factors (~0.21 kg-CO2e/kWh, 2024)",
    url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    note: "Conversion factor includes generation only; price changes quarterly.",
  },
  EUAVG: {
    title: "EU average: Eurostat household price (~€0.29/kWh, 2024); EEA average grid intensity (~0.25 kg-CO2/kWh)",
    url: "https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emission-intensity-of-1",
    note: "Ranges from ~0.03 (France, Sweden) to 0.6+ kg/kWh (coal-heavy grids). Pick 'Custom' for your country.",
  },
  AU: {
    title: "Australia: DCCEEW National Greenhouse Accounts factors (~0.65 kg-CO2e/kWh national, 2024); typical retail price ~A$0.33/kWh",
    url: "https://www.dcceew.gov.au/climate-change/publications/national-greenhouse-accounts-factors",
    note: "State factors range from very low (Tasmania) to high (Victoria).",
  },
  IN: {
    title: "India: Central Electricity Authority CO2 baseline database (~0.71 kg-CO2/kWh); typical domestic tariff ~₹8/kWh",
    url: "https://cea.nic.in/cdm-co2-baseline-database/",
    note: "Tariffs are slab-based and vary by state.",
  },
};

export const REGIONS = [
  { id: "JP", label: "Japan (default)", currency: "¥", decimals: 0, price: 31, co2: 0.44, src: "JP" },
  { id: "US", label: "United States", currency: "$", decimals: 2, price: 0.17, co2: 0.37, src: "US" },
  { id: "UK", label: "United Kingdom", currency: "£", decimals: 2, price: 0.25, co2: 0.21, src: "UK" },
  { id: "EU", label: "EU average", currency: "€", decimals: 2, price: 0.29, co2: 0.25, src: "EUAVG" },
  { id: "AU", label: "Australia", currency: "A$", decimals: 2, price: 0.33, co2: 0.65, src: "AU" },
  { id: "IN", label: "India", currency: "₹", decimals: 1, price: 8, co2: 0.71, src: "IN" },
  { id: "CUSTOM", label: "Custom (from my bill)", currency: "", decimals: 2, price: 0.2, co2: 0.4, src: null },
];

export const ROOMS = [
  { id: "desk", name: "Desk & bedroom", tip: "Look under the desk and behind the bed: chargers, power bricks, anything with a light or a warm adapter." },
  { id: "living", name: "TV & living area", tip: "TVs, recorders, consoles and sound gear are the classic phantom-load cluster." },
  { id: "kitchen", name: "Kitchen", tip: "Clocks and touch panels are small; keep-warm heaters are big." },
  { id: "bath", name: "Bathroom & toilet", tip: "Heated toilet seats run 24/7. Chargers live here too." },
];

// Smart plug self-consumption in watts [low, typical, high].
export const PLUG_W = [0.3, 0.5, 1];

const unplug = { id: "unplug", label: "Unplug it when not in use", kind: "cut", frac: 1, manual: true };
const strip = { id: "strip", label: "Put it on a switched power strip and switch the strip off", kind: "cut", frac: 1, manual: true };
const smart = { id: "smart", label: "Smart plug that switches it off on a schedule", kind: "cut", frac: 1, manual: false, plug: true };

export const DEVICES = [
  // Desk & bedroom
  { id: "laptop-charger", room: "desk", name: "Laptop charger left plugged in", hint: "Charger in the wall with no laptop attached, or a fully charged laptop still on charge.", w: [0.1, 0.5, 2.5], hours: 14, src: ["LBNL", "EU"], actions: [unplug, strip, smart] },
  { id: "phone-charger", room: "desk", name: "Phone charger with no phone", hint: "Modern chargers are tiny; old or cheap ones draw more.", w: [0.03, 0.1, 0.5], hours: 18, src: ["LBNL", "EU"], actions: [unplug, smart] },
  { id: "desktop-pc", room: "desk", name: "Desktop PC (off or asleep)", hint: "Sleep with wake-on-LAN, RGB lighting or USB charging is at the high end.", w: [0.5, 2, 6], hours: 16, src: ["LBNL", "ESTAR"], actions: [strip, smart, { id: "shutdown", label: "Shut down / hibernate instead of sleep (setting)", kind: "reduce", to: [0.3, 0.6, 1.5], frac: 1, manual: false }] },
  { id: "monitor", room: "desk", name: "Computer monitor (standby)", hint: "Amber standby light on.", w: [0.2, 0.4, 1.5], hours: 16, src: ["ESTAR", "EU"], actions: [strip, smart] },
  { id: "speakers", room: "desk", name: "Powered speakers / subwoofer / amp", hint: "Always-lit LED or a warm power brick are giveaways.", w: [1, 3, 8], hours: 20, src: ["LBNL"], actions: [strip, smart] },
  { id: "printer", room: "desk", name: "Inkjet printer (idle)", hint: "Sits ready for the one page you print each week.", w: [0.5, 2, 5], hours: 23.5, src: ["LBNL", "ESTAR"], actions: [unplug, strip] },
  { id: "console", room: "desk", name: "Game console in rest / instant-on mode", hint: "PlayStation Rest Mode or Xbox Sleep (instant-on) keeps network and USB power alive for downloads.", w: [1, 8, 15], hours: 20, src: ["LBNL", "EU"], actions: [{ id: "eco", label: "Switch to energy-saving / full shutdown mode in the console settings", kind: "reduce", to: [0.2, 0.5, 1], frac: 1, manual: false }, strip] },
  { id: "smart-speaker", room: "desk", name: "Smart speaker (always listening)", hint: "It never truly sleeps; unplugging means no voice control.", w: [1.5, 2.5, 4], hours: 24, src: ["LBNL"], actions: [{ id: "night", label: "Smart plug: off overnight (8 h)", kind: "cut", frac: 8 / 24, manual: false, plug: true }, { ...unplug, label: "Unplug it (you lose voice control)" }] },
  { id: "router", room: "desk", name: "Wi-Fi router (always on)", hint: "Always on by design. Only schedule it off if nothing (VoIP phone, cameras, a roommate) depends on it overnight.", w: [4, 7, 12], hours: 24, src: ["LBNL"], actions: [{ id: "night", label: "Timer plug: off 1 am – 7 am (6 h)", kind: "cut", frac: 6 / 24, manual: false, plug: true }] },
  { id: "desk-lamp", room: "desk", name: "LED lamp / light strip with wall adapter", hint: "The adapter stays warm even with the light off.", w: [0.2, 0.5, 2], hours: 20, src: ["LBNL"], actions: [unplug, strip] },
  // Living / TV
  { id: "tv", room: "living", name: "TV in standby", hint: "Modern TVs are ~0.5 W, but 'quick start', 'instant on' or voice wake can push standby to 10 W or more.", w: [0.3, 1, 12], hours: 20, src: ["ESTAR", "EU", "LBNL"], actions: [{ id: "quickstart", label: "Turn off quick-start / instant-on in the TV settings", kind: "reduce", to: [0.2, 0.4, 1], frac: 1, manual: false }, strip] },
  { id: "recorder", room: "living", name: "Blu-ray / HDD recorder or set-top box", hint: "'Quick start' (高速起動) modes are the heavy ones. Don't unplug if it records on a schedule.", w: [0.1, 4, 20], hours: 22, src: ["LBNL"], actions: [{ id: "quickstart", label: "Turn off quick-start mode (scheduled recording still works)", kind: "reduce", to: [0.1, 0.3, 1], frac: 1, manual: false }] },
  { id: "soundbar", room: "living", name: "Soundbar", hint: "Often waits for an HDMI or Bluetooth wake signal.", w: [0.5, 2, 5], hours: 20, src: ["LBNL", "EU"], actions: [strip, smart] },
  { id: "streaming", room: "living", name: "Streaming stick / box", hint: "Powered from its own USB adapter.", w: [0.5, 1.5, 3], hours: 20, src: ["LBNL"], actions: [unplug, strip] },
  { id: "aircon", room: "living", name: "Air conditioner (indoor unit standby)", hint: "Matters in spring and autumn when it sits unused for months.", w: [0.5, 1.5, 4], hours: 24, src: ["LBNL"], actions: [{ id: "season", label: "Switch it off at the plug or breaker for the ~4 off-season months (if reachable)", kind: "cut", frac: 1 / 3, manual: true }] },
  // Kitchen
  { id: "microwave", room: "kitchen", name: "Microwave with clock display", hint: "Many Japanese models without a clock draw almost nothing; skip those.", w: [0.5, 2, 4], hours: 23.8, src: ["LBNL"], actions: [unplug, strip] },
  { id: "rice-cooker", room: "kitchen", name: "Rice cooker on keep-warm (保温)", hint: "Hours = how long rice sits warm each day. Savings are net of reheating in a microwave (ANRE assumes 7 h/day ≈ 46 kWh/yr).", w: [13, 18, 30], hours: 7, src: ["ANRE"], actions: [{ id: "nokeep", label: "Don't keep warm: refrigerate or freeze portions and reheat", kind: "cut", frac: 1, manual: true }] },
  { id: "pot", room: "kitchen", name: "Electric hot-water pot (電気ポット) keeping water hot", hint: "Hours = time per day it stays plugged in while nobody uses it (overnight, during class). ANRE: ≈107 kWh/yr saved by unplugging during long idle periods.", w: [15, 30, 45], hours: 8, src: ["ANRE"], actions: [{ id: "unplug", label: "Unplug it when leaving for class and at night; use a kettle for one cup", kind: "cut", frac: 1, manual: true }] },
  { id: "coffee", room: "kitchen", name: "Coffee maker / kettle base with display", hint: "Clock or standby light.", w: [0.3, 1, 3], hours: 23, src: ["LBNL"], actions: [unplug] },
  // Bathroom
  { id: "toilet-seat", room: "bath", name: "Heated toilet seat / bidet (温水洗浄便座)", hint: "Heats 24/7. Yearly use is a rough estimate: instant-heating models are at the low end, tank models at the high end.", baselineKwh: [90, 170, 280], src: ["ANRE"], actions: [
    { id: "lid", label: "Close the lid after use (ANRE ≈34.9 kWh/yr)", kind: "kwh", kwh: [20, 34.9, 40], manual: true },
    { id: "temps", label: "Seat and wash-water temperature one step lower (setting; ANRE ≈26.4 + 13.8 kWh/yr)", kind: "kwh", kwh: [25, 40.2, 45], manual: false },
    { id: "both", label: "Both: close the lid and lower both temperatures (≈75 kWh/yr; savings may overlap)", kind: "kwh", kwh: [45, 70, 85], manual: true },
  ] },
  { id: "toothbrush", room: "bath", name: "Electric toothbrush charger always on its base", hint: "Inductive chargers waste a lot for what they deliver.", w: [0.5, 1.2, 2], hours: 22, src: ["LBNL"], actions: [{ id: "weekly", label: "Charge it one night a week, then unplug", kind: "cut", frac: 0.85, manual: true }] },
  { id: "shaver", room: "bath", name: "Shaver / hair-tool charger left plugged in", hint: "Small, but often forgotten.", w: [0.2, 0.8, 2], hours: 22, src: ["LBNL"], actions: [unplug] },
];

export const CUSTOM_ACTIONS = [unplug, strip, smart];

// Example: a typical 1R student apartment / dorm room in Japan (fictional).
export const EXAMPLE = {
  items: {
    "laptop-charger": { on: true, count: 1, hours: 14, action: "unplug" },
    "phone-charger": { on: true, count: 2, hours: 18, action: "" },
    monitor: { on: true, count: 1, hours: 16, action: "strip" },
    speakers: { on: true, count: 1, hours: 20, action: "strip" },
    console: { on: true, count: 1, hours: 20, action: "eco" },
    router: { on: true, count: 1, hours: 24, action: "" },
    "desk-lamp": { on: true, count: 1, hours: 20, action: "strip" },
    tv: { on: true, count: 1, hours: 20, action: "quickstart" },
    microwave: { on: true, count: 1, hours: 23.8, action: "" },
    "rice-cooker": { on: true, count: 1, hours: 7, action: "nokeep" },
    "toilet-seat": { on: true, count: 1, action: "both" },
    toothbrush: { on: true, count: 1, hours: 22, action: "weekly" },
  },
};
