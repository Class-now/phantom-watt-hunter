## Inspiration

Walk into any student room at 2 am with the lights off and count the little LEDs: chargers, a console waiting for updates, a TV in quick-start, a speaker brick that's warm to the touch, and — in Japan — a heated toilet seat and a rice cooker on keep-warm. Standby is estimated at roughly 5–10% of household electricity (U.S. DOE; Japan's own survey found about 5%), and it runs 8,760 hours a year. But the usual advice, "unplug your chargers", is mostly wrong: a modern phone charger draws ~0.1 W, while a console in instant-on mode draws ~8 W. We wanted a tool that tells a student *which* of their things matter, by how much, and how sure we can be.

## What it does

Phantom Watt Hunter is a four-step walkthrough:

1. **Setup** — region defaults (Japan: 31 ¥/kWh, 0.44 kg CO₂/kWh) or your own bill's price and grid factor.
2. **Hunt room by room** — desk & bedroom, TV & living, kitchen, bathroom. Tick what you have; each device shows kWh, cost and CO₂ per year **as a range** based on cited typical standby watts. If you own a plug meter, enter the measured watts and the range shrinks to ±10%. Add unlisted devices with your own measurement.
3. **Pick actions** — unplug, switched strip, smart plug on a schedule, or a settings change (console energy-saving mode, TV quick-start off, toilet lid and temperatures). A follow-through slider scales manual habits; settings and timers don't forget.
4. **Plan & track** — before/after cards and a range bar, a checklist grouped by room, "locked in" savings as you tick actions off, plus print, CSV and text export. All saved in the browser; nothing leaves the device.

**Example (fictional 1R dorm room, Tokyo):** standby and keep-warm loads ≈ 402 kWh/yr (range 187–811) → ≈ 219 kWh/yr after nine free actions. That's **≈ 183 kWh, ≈ ¥5,700 and ≈ 80 kg CO₂ saved per year** (range 74–410 kWh). The biggest wins were a console setting and keep-warm heaters — not phone chargers.

## How we built it

Plain HTML, CSS and JavaScript modules — no framework, no build, no runtime dependencies, no network requests, so it loads fast on an old phone and works offline once opened. The calculation module is pure functions over `[low, typical, high]` triples, so every number in the UI carries its uncertainty. The device library (22 devices in 4 rooms) was compiled from LBNL standby measurements, ENERGY STAR and EU Ecodesign limits, and Japan's ANRE per-action savings. Unit tests run on `node:test`; a headless Playwright script checks the full flow at desktop and 360 px phone widths, including localStorage persistence, CSV/text export, print layout and "no external requests". The demo video was recorded by the same kind of headless script with a captions overlay.

## Challenges we ran into

- **Honest numbers.** Published standby values differ by 10× between models and years. We chose to show ranges everywhere and to pair the low-savings case with the highest smart-plug overhead, rather than print a single impressive number.
- **Advice that backfires.** Modelling a smart plug's own 0.3–1 W draw revealed that putting one on a phone charger *increases* consumption. The app now says so in red.
- **Human behaviour.** "Unplug it" only works if you remember. The follow-through slider makes that assumption visible and adjustable.
- **Japan-specific loads.** Heated toilet seats, electric hot-water pots and rice-cooker keep-warm don't appear in most Western standby tables, so we used ANRE's published per-action savings.

## Accomplishments that we're proud of

- Every result is a range with a source, and a plug-meter reading tightens it.
- It turns an abstract "save energy" into a concrete, printable, room-by-room checklist with a running "locked in" total.
- Accessible by default: labelled inputs, fieldsets, headings, focus management, a live tally, 44 px touch targets, print stylesheet.
- Zero data collection.

## What we learned

The biggest standby savings in a student room are usually settings, not plugs — console instant-on modes, TV quick-start and recorder quick-start can each be worth more than every charger combined. And keep-warm heaters (rice cookers, hot-water pots, toilet seats) dwarf classic "phantom" loads in Japanese homes.

## What's next

- Import readings from smart plugs or a CSV of plug-meter measurements.
- Dorm-floor or share-house mode: aggregate several rooms into one anonymous before/after.
- A bigger, versioned device library with per-model data where available, and Japanese UI text.
- A monthly reminder to re-check ticks, with the option to log a meter reading to verify.

## Limitations

These are estimates. Standby varies widely by model; only a plug meter tells you your device. The library is small (22 devices) and uses rounded summary values; the heated toilet seat baseline is rough (its savings come from ANRE). Grid factors are annual averages, not marginal emissions. Before/after counts only the loads you logged, not your whole bill. One action per device is counted, and savings from combined toilet-seat actions may overlap. "Locked in" savings are self-reported ticks, not metered.

## Credits & AI disclosure

- Data (approximate, rounded; full list in the app): Lawrence Berkeley National Laboratory Standby Power; ENERGY STAR; EU Ecodesign Reg. 1275/2008 and 2023/826; IEA "Things that go Blip in the Night"; U.S. DOE Energy Saver; Agency for Natural Resources and Energy, Japan; price and grid factors from 全国家庭電気製品公正取引協議会, Japan MOE, EIA, EPA eGRID, Ofgem, DESNZ, Eurostat, EEA, DCCEEW, CEA.
- AI assistance: built with Claude Code (Anthropic), which wrote the code, compiled the device ranges from the sources above, wrote the tests and produced the demo video with a headless browser script.
- All work was created during the hackathon (from 2026-11-10). Open source under the MIT licence.
