# Poly Runner: architecture (stable facts; update when they change)

## Files
- `checker-run.html`: the whole game, a single file built on three.js r128. It embeds:
  - the Path Editor, between `<!--PE-BEGIN-->` and `<!--PE-END-->`, generated from `path-editor.html` by `python3 tools/mk_pe_embed.py` (never hand-edit the embed);
  - the Rig Editor, in `<template id="rig-tpl">`, booted by `window.__rigBoot`;
  - the built-in models `#molly-glb` and `#comet-glb`, baked by `python3 tools/bake_models.py`;
  - the shipped settings `#molly-settings` and `#comet-settings` (Comet's has no `mn.*`).
- `desktop/`: the Electron app (one copy only, file backups through `window.polyrun`). The update folder `~/.config/PolyRun/game` overrides the built-in game.
- `tools/`:
  - `mk_pe_embed.py`, `bake_models.py`;
  - `build_release.py` (the offline game zip and desktop zip);
  - `reslice.py` (the sweep's 20 slices).
- `tests/`: the Playwright + swiftshader harness (`righ.py` has the `Rig` class).
- `.github/workflows/release.yml`: publishes under the `<div class="ver">` label when a push to `main` touches the game, `desktop/` or the release tooling.
- `SWEEP.md`: the nightly sweep's state; reports go in `sweep-reports/`.
- `audit-notes.md`: the long log. The `var CHANGELOG` in the game is the player-facing log.

## Runners
- `CHAR` is 'molly' or 'comet' (localStorage `pr_char`), picked on the Characters page; `setChar` switches.
- Dials are stored in `runnerRig2` (Molly, plus the `mn.*` mob dials) and `cometRig` (Comet, never `mn.*`).
- Lookup order is `rigPick`: what's stored, then `SHIPPED[ch]`, then the built-in RIGCFG / COMET_DEF numbers.
- Saved models are in IndexedDB `polyrun` / `kv` under `mollyGlb` and `cometGlb`; `loadCharModel` falls back to the built-in model.
- Comet:
  - Star Throw: Q/E, `starPress` / `starRelease` / `spawnStar` / `cometStars`.
  - Hover and Fly: `hovOn` / `flyOn` / `applyStats`.
  - Poses: dial sets `comet.pc|pt|pf|ho|fl.*`, applied by `cometPose` through the shared `window.__cometQ`.
- The Rig Editor has pages Molly / Comet / Mobs (`setPage`, `loadChar`, `DEFM` / `DEFC`). Copy settings copies `{molly, comet, mobs}`.

## World
- Units: TILE 2 (1 Zip = 2 u/s). Speeds are shown in Zips.
- Levels 1 and 2 are built in. The sandbox (level 3) is built from Path Editor JSON by `sbBuild` (spatial hashes `sbHash` / `sbNear`); the world sits at x offset `L3_X` (60000).
- Grass Canyon is the sandbox layout `OFFICIAL_L1`.
- True Y: `yAbs` in JSON is measured from the first path sample (`B.y0`); in the game `o.T = ya + y0`.
- Interactables: pressure plates (`B.plates`) and targets (`B.targets`), registered in `B.trig` by id; a door switches to its After mode once every linked minion is beaten, plate pressed and target broken (`sbDoorLinked`).

## Branches
- `next`: interactive work. `main`: releases (a push publishes when it touches the game, `desktop/` or the release tooling). `nightly/YYYY-MM-DD`: the 03:00 Central sweep.
- Versions are Ricky's to call; nightly fixes are numbered vN.1, vN.2 and so on.
