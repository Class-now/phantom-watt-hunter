# Phantom Watt Hunter

**A room-by-room walkthrough that finds the standby ("phantom") power in a student room or rental, and turns it into a measurable plan: kWh, money and CO₂ per year — shown as honest ranges, not single magic numbers.**

- Live app: https://class-now.github.io/phantom-watt-hunter/
- Demo video: see `submission/demo.mp4` (and the Devpost page)
- Built for [Green Shift Hacks](https://green-shift-hacks.devpost.com/) (November 2026)

## The problem

Chargers, game consoles in "rest mode", TVs with "quick start", rice cookers on keep-warm and heated toilet seats all draw power while nobody is using them. Studies put standby at roughly **5–10% of household electricity** (U.S. DOE; IEA estimated 5–15% around 2000; Japan's FY2012 survey about 5%). It is invisible, it runs 8,760 hours a year, and almost nobody knows *which* of their devices matter.

Generic tips ("unplug your chargers!") don't help much: a modern phone charger draws about 0.1 W, while a console in instant-on mode can draw 10 W. Students and renters also can't change the building, the fridge or the insulation — but they **can** change their plugs and settings.

## Who it's for

Students in dorms or one-room apartments, and renters in general: people who pay a power bill (or share one), own a pile of electronics, and have five minutes and no budget.

## How to use it

1. **Setup** — pick a region (Japan by default: 31 ¥/kWh, 0.44 kg CO₂/kWh) or type the price and grid factor from your own bill.
2. **Hunt room by room** — Desk & bedroom → TV & living → Kitchen → Bathroom. Tick what you have, set how many and how many hours a day it sits in standby. Each device shows its estimated kWh, cost and CO₂ per year *as a range*. If you own a plug-in power meter, type the measured watts and the range collapses to ±10%. You can add devices that aren't listed, using your own measurement.
3. **Pick actions** — for each device choose one fix: unplug, switched power strip, smart plug on a schedule, or a settings change (console energy-saving mode, TV quick-start off, toilet seat lid/temperature). A follow-through slider (default 80%) scales manual habits, because people forget; settings changes and timers don't.
4. **Plan & track** — before/after cards (kWh, money, CO₂), a range bar, and a checklist grouped by room. Tick actions as you do them; the "locked in" total shows the savings you have actually made. Print the checklist, or download CSV / plain text. Everything is saved in your browser (localStorage) — no account, no server, no network requests.

Keyboard and screen-reader friendly (real labels, fieldsets, headings, focus moves to each step's heading, live tally), and works on small phones.

## Before / after: an example dorm room (fictional)

A one-room student apartment in Tokyo with the default Japan settings (31 ¥/kWh, 0.44 kg CO₂/kWh, 80% follow-through). Load it with **"Load an example dorm room (Japan)"** in the app.

| Device | Standby now (typical) | Action picked | Saved / yr (typical) |
|---|---|---|---|
| Heated toilet seat | 170 kWh (rough estimate) | Close lid + lower seat & water temp | 56 kWh |
| Game console, rest mode, 20 h/day | 58 kWh | Energy-saving mode (setting) | 55 kWh |
| Rice cooker keep-warm, 7 h/day | 46 kWh | Don't keep warm; freeze & reheat | 37 kWh |
| Powered PC speakers | 22 kWh | Switched power strip | 18 kWh |
| Electric toothbrush on its base | 10 kWh | Charge one night a week | 7 kWh |
| TV standby | 7 kWh | Quick-start off (setting) | 4 kWh |
| Desk lamp adapter, monitor, laptop charger | 9 kWh | Strip / unplug | 7 kWh |
| Wi-Fi router, microwave clock, 2 phone chargers | 80 kWh | Kept as is | 0 |

| | kWh / yr | Cost / yr | CO₂ / yr |
|---|---|---|---|
| **Before** | **≈ 402** (range 187–811) | ≈ ¥12,500 | ≈ 177 kg |
| **After** | **≈ 219** (range 113–401) | ≈ ¥6,800 | ≈ 96 kg |
| **Saved** | **≈ 183** (range 74–410) | **≈ ¥5,700** | **≈ 80 kg** |

That is roughly 45% of this room's standby and keep-warm load, for zero money: nine actions, most of them a one-time settings change or a power strip already in the drawer. The two biggest wins are not "phantom" chargers at all — they are a console setting and keep-warm heaters — which is exactly the kind of thing the walkthrough is meant to surface. And the app says plainly where effort is wasted: a smart plug on a phone charger uses more power than it saves.

## How the numbers work

- Yearly kWh = watts × hours per day in standby × 365 ÷ 1000 × number of devices.
- Each library device has a **low / typical / high** wattage, rounded from public measurements and standards (see Sources). The headline uses "typical"; the range uses low and high. Savings ranges pair the low case with the highest smart-plug overhead, so the low end is conservative.
- A measured value replaces the library range with ±10% (typical accuracy of cheap plug meters at low watts).
- Smart plugs are charged 0.3–1 W for 24 h a day. Plain switched strips are assumed to use nothing.
- The heated toilet seat and keep-warm heaters use per-action savings published by Japan's Agency for Natural Resources and Energy (ANRE).
- Money and CO₂ are kWh × your price and grid emission factor.

## Limitations (please read)

- **These are estimates.** Standby varies by an order of magnitude between models; that is why every result is a range. A plug meter is the only way to know your device.
- The device library is small (22 devices) and its wattages are rounded from published summary values, not from a full database. Values for newer products are usually at the low end of each range.
- The heated-toilet-seat baseline is a rough figure; only its savings come directly from ANRE.
- Grid factors are annual averages. The plant your saving actually turns down at 3 am may be cleaner or dirtier.
- Before/after covers only the loads you logged, not your whole bill. Savings on separate actions for one device (e.g. toilet lid and temperature) may overlap.
- Only one action per device is counted; shared smart strips are counted per device, which overstates their overhead.
- Follow-through is self-reported. "Locked in" counts what you tick, not what a meter verified.
- Data stays in one browser; clearing site data erases it. Use the CSV export as a backup.

## Run it locally

No build step and no runtime dependencies — it is plain HTML, CSS and JavaScript modules.

```sh
node scripts/serve.mjs          # http://127.0.0.1:8731/
npm test                        # unit tests for the calculations (node:test)
npm install && npm run smoke    # headless Playwright end-to-end check (desktop + 360 px phone)
```

## Built during the event

Everything in this repository was created from scratch on 2026-11-10 for Green Shift Hacks: the app, device library, calculations, tests, screenshots and demo video.

## Credits

- **Data sources** (approximate values, rounded; links in the app's "Sources & assumptions"):
  - Lawrence Berkeley National Laboratory, *Standby Power* measurements — https://standby.lbl.gov/
  - ENERGY STAR product specifications — https://www.energystar.gov/products
  - EU Ecodesign standby rules, Reg. (EC) 1275/2008 and (EU) 2023/826
  - IEA (2001), *Things that go Blip in the Night*; One Watt Initiative
  - U.S. DOE Energy Saver (standby ≈ 5–10% of residential electricity)
  - Agency for Natural Resources and Energy, Japan (資源エネルギー庁), household energy-saving guide — per-action savings for toilet seats, electric pots, rice cookers
  - Price and grid factors: 全国家庭電気製品公正取引協議会 (31 ¥/kWh), Japan Ministry of the Environment emission factors, EIA, EPA eGRID, Ofgem, DESNZ, Eurostat, EEA, DCCEEW (Australia), CEA (India)
- **AI assistance:** built with Claude Code (Anthropic), which wrote the code, compiled the device ranges from the sources above and produced the demo video via a headless browser script.
- Licence: MIT.
