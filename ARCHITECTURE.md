# Architecture (stable facts; update when they change)

**What:** Poly Run (Polyrunner), a single-file three.js r128 platformer starring Molly, with an embedded Path Editor and Rig Editor.

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
- `SWEEP-BUGS.md`, `SWEEP-EDGES.md`, `SWEEP-PERF.md`: the three nightly sweeps; their state files and reports go in `sweep-reports/`.
- `audit-notes.md`: the long log, frozen on 2026-11-20 (last entry v184); `HISTORY.md` continues it. The `var CHANGELOG` in the game is the player-facing log.

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
- Grass Canyon is the sandbox layout `OFFICIAL_L1`; Oceana Crags is `OFFICIAL_L2` (the old built-in level 2 still supplies its terrain).
- True Y: `yAbs` in JSON is measured from the first path sample (`B.y0`); in the game `o.T = ya + y0`.
- Interactables: pressure plates (`B.plates`) and targets (`B.targets`), registered in `B.trig` by id; a door switches to its After mode once every linked minion is beaten, plate pressed and target broken (`sbDoorLinked`).

## Branches and versions
- `next`: interactive work (push freely). `main`: releases; a push publishes when it touches the game, `desktop/` or the release tooling, under the `<div class="ver">` label. `nightly/YYYY-MM-DD-<bugs|edges|perf>`: the three nightly sweeps (staggered times), never `main` except appending to `.md` docs (see SWEEP-*.md).
- A nightly branch is based on the newest unmerged branch of its own sweep (so nights stack as a chain), otherwise on `main`.
- By default, every push to `main` that isn't docs-only bumps the label in that same push to the next whole number (v184 -> v185), with its CHANGELOG entry, unless Ricky says otherwise. The workflow replaces the files of a release with the same label, so a push without a bump overwrites the current release. Always ask before merging `next` into `main`.
- Docs-only pushes (only `.md` files and `.gitattributes`) never change the version unless Ricky explicitly says so.
- Nightly sweeps get one decimal per night (the date in the branch name, `nightly/YYYY-MM-DD-...`): when the first fix branch of a night is merged to `main` (not docs-only), add a decimal if the label has none (v184 -> v184.1), otherwise raise it (v184.1 -> v184.2), with one CHANGELOG entry for that label. Other branches of the same night merged afterwards leave the number alone and add their fixes to that entry. The sweeps never edit the label themselves. If `main`'s label moved on since a branch was cut, apply the decimal to `main`'s current label. Then merge `main` into `next`.
- Find nightly branches with `git ls-remote origin 'refs/heads/nightly/*'` (`git fetch` leaves no remote-tracking refs). GitHub refuses branch deletion, so merged nightly branches stay.
- Publish (only when Ricky says): bump the label on `next` (rule above), merge `--no-ff` into `main`, push, `gh run list -b main -L 1`, fast-forward `next`.
- `HISTORY.md` is append-only and merges with git's union driver (`.gitattributes`), so branches that both appended keep every line. Merge on the command line as above (GitHub's web merge button ignores `.gitattributes`).

## Run and test
- Once per fresh session: `sh tests/setup.sh`.
- After every edit: `python3 tests/chk.py && python3 tests/mk_test.py`. Then run only the tests for the area touched (map in any SWEEP-*.md), from inside `tests/`.
- Tests under `tests/fu/` are per-feature; run one only when touching that feature.
- Old build for comparison: `python3 tests/mk_test.py OLD.html /tmp/polyrun-work/t/aud_main.html`, then pass `html='aud_main.html'` to `Rig()`.
- Keep scratch backups in `/tmp`, never in the repo.

## Docs
- `README.md`: what it is, run, test, updating, files.
- `CLAUDE.md`: working rules for sessions (Ricky approves edits).
- `ARCHITECTURE.md`: this file.
- `HANDOFF.md`: current state; overwritten each time.
- `BACKLOG.md`: open bugs and ideas (the nightly sweeps append their suggestions here).
- `HISTORY.md`: append-only record of every change since 2026-11-20; not read unless Ricky asks. The nightly sweeps add their own line each night.
- `SWEEP-BUGS.md`, `SWEEP-EDGES.md`, `SWEEP-PERF.md`, `sweep-reports/`: the nightly sweeps (see Files).
- `audit-notes.md`: frozen long log (see Files). `desktop/README.md`: the desktop app.
