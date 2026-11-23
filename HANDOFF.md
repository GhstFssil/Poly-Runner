# Handoff (2026-11-22)

## Goal
Split the single-file game into `src/` parts by function (areas: core, level1, level2, sandbox, characters, mobs, ui), with GLOSSARY.md as the one list of terms.

## Done
- Step 0/1: `src/manifest.json` + `tools/build.py`; `checker-run.html` is generated and byte-identical; data is in `src/data/`, code in `src/unsorted/` (cut in place, game order).
- GLOSSARY.md written; Enemy -> Mob, Title Case labels, Rotation (`rot`), term sweep (all in v185/v186).
- v185: mobs area (`src/mobs/mobs.js`), `tools/check_deps.py`. v186: ui cuts `speedometer`, `health`, `menu`, `screens`.
- 2026-11-22: `next` had been left at v185 and was synced to `main` (fast-forward, v186).
- 2026-11-22, on `next` (not published): ui cuts `src/ui/path-editor-host.js`, `rig-editor-host.js` (both from `04-script-b1b`; its tail is now `04-script-b1b2`) and `menu-wiring.js` (all of old `05-script-c.js`). Byte-identical; chk, mk_test, pe*, rx5/6/8, fu3, fu6, halfheart, y2, y3 pass.
- 2026-11-22: v187 published (ui host cuts, menu wiring, level2). `next` = `main`.
- 2026-11-22, on `next` (not published): level1 area: `src/level1/level1.js` (Valley, cave, doorway/mud ramp/field; was `04-script-b1b` 38-482, which now holds only Renderer / scene, 37 lines, for core). Byte-identical; chk, mk_test, ends1, cavejoin, door1/2, tunfloor, shaft1, nopit, coords1, reg2/3/4 pass. Part order: b1b, level1, level2, b1b3, ...
- 2026-11-22: level2 area: `src/level2/level2.js` (Oceana Crags, Crags, Sink; was `04-script-b1b` 483-713). Byte-identical; chk, mk_test, oc_new, reg2/3/4, coords1 pass. Part order is b1b, level2, b1b3, rig/path hosts, b1b2 (names are not in order).

- 2026-11-22, on `next` (not published): sandbox area: `src/sandbox/sandbox.js` (Level 3 / `sbBuild`, Caves, Walls, Pressure plates and targets; was `04-script-b1b3` 1-1699, one cut by Ricky's choice; b1b3 now starts at Trees). Byte-identical; chk, mk_test, ends1, cavejoin, door1/2, tunfloor, shaft1, nopit, coords1, wall1, reg2/3/4 pass (door1/reg2 print only GL perf noise). Part order: ..., sandbox, b1b3.

- 2026-11-22: v188 published (level1 + sandbox cuts, then the rest): `src/core/scene.js`, `src/core/loop.js` (Sizing, Clock, Loop), `src/level1/trees.js`, `src/characters/molly.js` (Movement details, State vars, Molly's model), `src/characters/comet.js`. Byte-identical; chk, mk_test, comet1/2, modes, rot1, ends1, reg2/3/4, rl1, righ, y2 pass. `mov`, `phys`, `rig1` fail only on missing comparison builds (same before the cuts). Part order: ..., sandbox, trees, molly, ..., 06-script-d (5 lines), comet, loop, 07-script-end (`})();` + `</script>`).

## In progress
On `next` (not published). `unsorted/` is gone: every part is in an area folder (2026-11-22, plan Ricky approved; file map in ARCHITECTURE.md). Steps: 1 Rig Editor -> characters; 2 `04-script-b1c` cut by section (hurt/`landFall` appended to `ui/health.js`, Strafe -> characters, props/goal -> level1, checkpoints/spawn -> core); 3 head -> `ui/page-head`, `page-body`, `path-editor-embed`; 4 leftovers: `core/start.html`, `pointer-lock.js`, `end.html`, `characters/molly-update.js`, `level1/cave-roof.js`. All byte-identical; chk, mk_test, rx8, fu3, fu6, righ, ends1, cavejoin, coords1, nopit, reg2/3/4, halfheart, modes, rot1, rl1, peobj, pesave, door1, tunfloor, shaft1, y2, comet1 pass. Waiting on Ricky before reordering parts by area.

## Decisions
- Terms: mob / minion / Big Minion / Roost Gazer; character; stat; tile; Barrier; Mud; Crags; every word of a label capitalized.
- Frozen storage names stay (see GLOSSARY.md). Cut in place first (byte-identical), reorder later.
- The Rig Editor's own panel and script are in the characters area, not ui.

## Next steps
1. Reorder parts by area (ask Ricky first): moving a part changes the game file's order, so it is no longer byte-identical; needs a wide test pass. `python3 tools/check_deps.py` shows coupling.
2. `menu-wiring.js` also holds pointer lock (`lockPointer`, `relockOnInput`): may belong in core; the State vars in `molly.js` (yaw, pitch, speed, drift) may belong in core. Split later.
3. `tools/mk_sweep_docs.py` is behind the SWEEP docs; sync or retire it, never regenerate blindly.
4. Recheck on this build: `fu/nf1.py` (crashes), `fu/wall4.py` (times out), `fu/door4.py`, `fu/minionhit.py` (flaky). `fu/door3.py` and `fu/steep1.py` also need the missing comparison builds.

## Gotchas
- Shallow clone: `git -c push.negotiate=true push`.
- Missing comparison builds (aud_head.html, aud_pre.html, aud_old.html, live.html): `fu2`, `fu4`, `pe_keep`, `rg1`, `rig2` can't run. `fu/y2.py` must run from `tests/`.
- `door4.py` fails and `minionhit.py` is ~50% flaky on old and new builds (in BACKLOG).
- Tests leave a `shots/` folder in the repo root; don't commit it.
- Tests hardcode `/home/claude/poly-runner`; a read-only clone elsewhere needs `ln -s <clone> /home/claude/poly-runner` first.
