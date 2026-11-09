# phantom-watt-hunter

Green Shift Hacks (Devpost, 2026-11) entry. Static web app (no build, no runtime deps): room-by-room standby-power walkthrough → kWh / cost / CO2 plan with ranges.
Contest management lives in `C:\For Claude\contest-pm` (brief: `docs/pm/student-hacks-1110-build-brief.md`). Follow `~/.claude/CLAUDE.md` instruction hierarchy.

- App: `index.html`, `styles.css`, `js/data.js` (devices, regions, sources), `js/calc.js` (pure range math), `js/app.js` (UI + localStorage `phantom-watt-hunter:v1`).
- Tests: `node test/calc.test.mjs`; E2E: `node scripts/smoke.mjs [url]` (headless Playwright).
- Submission assets: `node scripts/shots.mjs`, `node scripts/record-demo.mjs` → `submission/` (demo.mp4 is gitignored).
- Pages: https://class-now.github.io/phantom-watt-hunter/
