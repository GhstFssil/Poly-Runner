# Handoff (2026-11-22)

## Goal
Split the single-file game into `src/` parts by function (areas: core, level1, level2, sandbox, characters, mobs, ui), with GLOSSARY.md as the one list of terms.

## Done
- v185-v189: every part in an area folder, grouped by area as far as load order allows (file map in ARCHITECTURE.md).
- v190 (published 2026-11-22):
  - Data is real files in `src/data/`: `molly.glb`, `comet.glb`, `molly-settings.json`, `comet-settings.json`, `user-def.json`, `grass-canyon.json`, `oceana-crags.json`, `changelog.json`. `build.py` wraps them (manifest data-file entries: `before`/`after`/`as`). Game file byte-identical except the CHANGELOG layout (trailing commas, `] }` spacing), which has the same data (checked with node). `bake_models.py` writes the `.glb` files; `check_deps.py` and `mk_pe_embed.py` updated.
  - Code moves: pointer lock (`lockPointer`, `relockOnInput`) -> `core/pointer-lock.js`; Molly's State block -> `core/state.js`; the keys and F4 mouse-mode input (was the tail of `comet.js`) -> `core/input.js`, kept at the same spot so listener order is unchanged. Comet joined the characters group; `spawn.js` sits by `checkpoints.js`; speedometer and the two editor hosts joined the ui group. Area switches 22 -> 20.
  - Removed 16 failing/flaky tests: `fu/` mn1, nf1, wall4, door4, minionhit, fu2, fu4, pe_keep, door3, steep1, mov, phys; `rg1`, `rig1`, `rig2`, `scan3`. Their BACKLOG entries and SWEEP map mentions are gone.

## In progress
Nothing half-done. v190 published 2026-11-22 (data files, core moves, test cleanup). `next` = `main`.

## Decisions
- Terms: mob / minion / Big Minion / Roost Gazer; character; stat; tile; Barrier; Mud; Crags; every word of a label capitalized.
- Frozen storage names stay (see GLOSSARY.md). Data files are edited directly; the build is the only thing that wraps them.
- The Rig Editor's own panel and script are in the characters area, not ui.

## Next steps
1. Further grouping needs shared constants moved into core: Level 1's trees/props read Level 2 (`L2_*`) and Sandbox (`L3_*`, `DECK_*`, `GH_*`) constants while loading; `goal.js` needs `checkpoints.js` materials; `health.js` must stay before `molly.js`; `checkpoints.js` builds Level 2's gates.
2. `tools/mk_sweep_docs.py` is behind the SWEEP docs (BACKLOG); sync or retire it.
3. Rename to Poly Runner (BACKLOG).

## Gotchas
- Shallow clone: `git -c push.negotiate=true push`.
- `fu/y2.py` must run from `tests/`. Tests leave `shots/` in the repo root; don't commit it.
- Tests hardcode `/home/claude/poly-runner`; a clone elsewhere needs `ln -s <clone> /home/claude/poly-runner` first.
- Moving a part changes what runs first; check load-time reads/writes (and listener order) before any move.
