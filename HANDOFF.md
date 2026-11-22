# Handoff (2026-11-22)

## Goal
Split the single-file game into `src/` parts by function (areas: core, level1, level2, sandbox, characters, mobs, ui), with GLOSSARY.md as the one list of terms.

## Done
- Step 0/1: `src/manifest.json` + `tools/build.py`; `checker-run.html` is generated and byte-identical; data is in `src/data/`, code in `src/unsorted/` (cut in place, game order).
- GLOSSARY.md written; Enemy -> Mob, Title Case labels, Rotation (`rot`), term sweep (all in v185/v186).
- v185: mobs area (`src/mobs/mobs.js`), `tools/check_deps.py`. v186: ui cuts `speedometer`, `health`, `menu`, `screens`.
- 2026-11-22: `next` had been left at v185 and was synced to `main` (fast-forward, v186).
- 2026-11-22, on `next` (not published): ui cuts `src/ui/path-editor-host.js`, `rig-editor-host.js` (both from `04-script-b1b`; its tail is now `04-script-b1b2`) and `menu-wiring.js` (all of old `05-script-c.js`). Byte-identical; chk, mk_test, pe*, rx5/6/8, fu3, fu6, halfheart, y2, y3 pass.

## In progress
Nothing half-done. The batch above is committed on `next`; no version bump until Ricky publishes.

## Decisions
- Terms: mob / minion / Big Minion / Roost Gazer; character; stat; tile; Barrier; Mud; Crags; every word of a label capitalized.
- Frozen storage names stay (see GLOSSARY.md). Cut in place first (byte-identical), reorder later.
- The Rig Editor's own panel (`03-script-a`, about 57 rig mentions) stays for the characters area, not ui.

## Next steps
1. Ui is mostly done. Still in `unsorted`: `06-script-d` (game loop, comet code), `04-script-b1b` (rest of core, caves, walls, plates). Pick the next area from `python3 tools/check_deps.py` (one area per task).
2. `menu-wiring.js` also holds pointer lock (`lockPointer`, `relockOnInput`): may belong in core; split later.
3. `tools/mk_sweep_docs.py` is behind the SWEEP docs; sync or retire it, never regenerate blindly.
4. Recheck on this build: `fu/nf1.py` (crashes), `fu/wall4.py` (times out), `fu/door4.py`, `fu/minionhit.py` (flaky).

## Gotchas
- Shallow clone: `git -c push.negotiate=true push`.
- Missing comparison builds (aud_head.html, aud_pre.html, aud_old.html, live.html): `fu2`, `fu4`, `pe_keep`, `rg1`, `rig2` can't run. `fu/y2.py` must run from `tests/`.
- `door4.py` fails and `minionhit.py` is ~50% flaky on old and new builds (in BACKLOG).
- Tests leave a `shots/` folder in the repo root; don't commit it.
