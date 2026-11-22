# Handoff (2026-11-22)

## Goal
Split the single-file game into `src/` parts by function (areas: core, level1, level2, sandbox, characters, mobs, ui), with GLOSSARY.md as the one list of terms.

## Done
- 2026-11-22: v185 published (next merged into main). Mobs area carved (`src/mobs/mobs.js`), `tools/check_deps.py` added.
- Old procedural character body removed (47bdb52).
- Step 0: `src/manifest.json` + `tools/build.py`; `checker-run.html` is generated, byte-identical, `chk.py` detects drift.
- GLOSSARY.md written; docs-only push to main (7104d93), merged into `next`.
- On `next`: Enemy -> Mob rename in the game (`MOBS`, `killMob`, `updateMobs`; Path Editor's own list is `MOB_KINDS`); Path Editor labels in Title Case (Big Minion, Toxic Patch, Caution Sign, Seg Chain, Mud, Crags, ...).
- CLAUDE.md `src/` rules, BACKLOG.md and GLOSSARY.md updates on `next`.
- Step 1 (2026-11-21): `src/index.html` cut in place into `src/data/*` (settings, user-def, models, changelog, level1, level2) and `src/unsorted/01..06` (code, in game order). Build byte-identical to before.
- 2026-11-21: nightly check (newest branch 2026-11-17, report already on main, nothing for Ricky). Full test run on main's build; removed 13 stale tests on `next` (see HISTORY.md).

- 2026-11-22: ui area, first cut: `src/ui/speedometer.js`, `health.js`, `menu.js` carved from `04-script-b1`/`b2` (b1 split into `b1`, `b1b`, `b1c`; the `b2` tail comment moved to the top of `data/changelog.js`). Build byte-identical; chk, mk_test, halfheart, rx5/6/8 pass. Committed on `next`, not pushed.
- 2026-11-22: ui second cut: `src/ui/screens.js` (screen handlers, Dev Mode, level map, scoring) from the top of `06-script-d`. Byte-identical; no test covers it.

## In progress
Nothing half-done. `next` has this batch committed (see HISTORY.md).

## Decisions
- Terms: mob / minion / Big Minion / Roost Gazer; character; stat; tile; Barrier; Mud; Crags; every word of a label capitalized.
- Frozen storage names stay (see GLOSSARY.md).
- Cut in place first (byte-identical), reorder later.

## Open (Ricky decides)
- Done 2026-11-21: Rotation (`rot`; old `heading` still read; test `tests/fu/rot1.py`), dials->stats, "Hedron Barrier"->Barrier (also in the level hints), tile-meaning "square"->tile/cell (`LENGTH_TILES`, `VALLEY_TILES`, `LEDGE_FREE_TILES`).
- Done 2026-11-21: Title Case for 444 labels (script-converted; rule in GLOSSARY.md; `tcLabel` helper in `src/unsorted/03-script-a.html`). Tests and `tools/bake_models.py` text updated. `rg1.py` and `rig2.py` need comparison builds (aud_old.html, live.html) that are missing.

## Next steps
1. Carve the next area out of `src/unsorted/` (one area per task, cut in place, byte-identical check): `python3 tools/check_deps.py` shows the coupling. Mobs is done (`src/mobs/mobs.js`); ui is partly done: still to move are the Rig Editor and Path Editor host code in `04-script-b1c`, and the UI block in `03-script-a.html` (the Rig Editor's own panel, so it may belong with characters). After that ui is done; pick the next area from `check_deps.py`.
2. `tools/mk_sweep_docs.py` is behind the SWEEP docs; sync or retire it, never regenerate blindly (BACKLOG.md).
3. Tests to recheck on this build: `fu/nf1.py` (crashes), `fu/wall4.py` (times out), `fu/door4.py`, `fu/minionhit.py` (flaky).

## Gotchas
- Shallow clone: `git -c push.negotiate=true push`.
- `tests/fu/door4.py` fails and `minionhit.py` is ~50% flaky on both old and new builds (in BACKLOG).
- Comparison tests need old builds (aud_head.html, aud_pre.html).
