# Architecture (stable facts; update when they change)

**What:** Poly Runner, a single-file three.js r128 platformer starring Molly, with an embedded Path Editor and Rig Editor.

## Files
- `src/` and `tools/build.py`: the game's source. `src/manifest.json` names the output file and lists the source parts, which `python3 tools/build.py` joins byte for byte, in that order (a part is a source file, or a data file the build wraps: text as it is, a `.glb` as base64, `changelog.json` written out as `var CHANGELOG = [...]`), into `poly-runner.html` (`--check` fails if the two differ). Every part is in an area folder. The game is one script, so a part runs where it sits: the parts are grouped by area as far as load order allows (v190: 20 area switches) (a part that reads or sets a value another part sets while loading has to stay on the right side of it; the order with the fewest area switches was found with a small script), so an area can still be split across the list. `core/loop.js` stays last. Moving a part changes what runs first: check any move against those load-time uses. `src/data/` (real data files, edit them directly): `molly-settings.json`, `comet-settings.json`, `user-def.json` (`USERDEF`), `molly.glb`, `comet.glb` (the baked models), `changelog.json` (newest first; the player-facing change log), `grass-canyon.json` (`OFFICIAL_L1`), `oceana-crags.json` (`OFFICIAL_L2`). `src/core/`: `start.html` (opens the game script: page elements, Power and SEGS counters, world units, movement constants, slope helpers), `scene.js` (Renderer / scene), `spawn.js` (where she starts, `spawnAt`, `outOfHearts`), `pointer-lock.js` (pause when the lock is lost, `lockPointer`, `relockOnInput`), `state.js` (yaw, pitch, speed, heading, run phase, checkpoint times, Drift, Runner's Pose drop), `input.js` (keys and the F4 mouse modes), `loop.js` (Sizing, Clock, Loop), `end.html` (closes the script). `src/level1/`: `level1.js` (the old Grass Canyon's terrain: valley, plateau, cave, doorway/mud ramp/field; `groundH`, `groundGrad`, `ledgeH` / `oldLedgeH`, `mudAt`), `trees.js` (the layout's stamped trees, Sunset Hill's own trees, trunk collision), `props.js` (`buildSign`, toxic bubbles, Segs), `goal.js` (the water material `waterMat`, style boost and confetti state). `src/level2/level2.js`: the old Oceana Crags' terrain (the runway path, the Crags range, the Sink), `level2H`. `src/sandbox/sandbox.js`: Level 3 / `sbBuild`, Caves, Walls, Pressure plates and targets. `src/characters/`: the Rig Editor (`rig-editor-panel.html`, its `rig-tpl` template; `rig-editor-start.html` and `rig-editor.html`, its script; the hair cap and hair locks are built in `headFeatures` / `hairLocks`, tests `tests/fu/hair1.py`, `tests/fu/ringlet1.py` (ringlets, the Ponytail switch)), `molly.js` (Movement details, Molly's model), `molly-update.js` (`mollyHold`, `updateMolly`), `molly-moves.js` (tilt and jump state, Strafe), `strafe-streaks.js`, `comet.js` (Comet's moves), `character-stats.js` (her player group, `RIGCFG` and its defaults, which character she plays as, `applyStats`, the stat cards; loads right after `trees.js`). `src/mobs/mobs.js`: Mobs, Roost Gazer, `updateMobs`. `src/ui/`: `page-head.html` (page head and game CSS), `page-body.html` (game markup, three.js script tags), `path-editor-embed.html` (the generated PE-BEGIN/END block), `speedometer.js` (Speedometer, Dodecadash charge bar), `health.js` (hearts, breath bubbles, hurt flash, camera shake, `landFall`), `menu.js` (the Input; the Sandbox's checkpoint buttons, `cpFill`), `screens.js` (screen button handlers, Dev Mode, level map, the Level Cleared scoring screen), `rig-editor-host.js` (`openRig`), `path-editor-host.js` (`openPE`, the live view beside the game), `menu-wiring.js` (changelog list, `showScreen`, `begin`/`pause`, graphics settings, saves, button handlers). `python3 tools/check_deps.py` (warning only) shows which areas use names from other areas. **Edit `src/`, then build.** `tools/mk_pe_embed.py` and `tools/bake_models.py` edit the part that holds their markers, then build.
- `poly-runner.html`: the shipped game, a single file built on three.js r128. It is generated from `src/` but committed (tests, the release workflow and the desktop app read it); never hand-edit it. It embeds:
  - the Path Editor, between `<!--PE-BEGIN-->` and `<!--PE-END-->`, generated from `path-editor.html` by `python3 tools/mk_pe_embed.py` (never hand-edit the embed);
  - the Rig Editor, in `<template id="rig-tpl">`, booted by `window.__rigBoot`;
  - the built-in models `#molly-glb` and `#comet-glb`, baked by `python3 tools/bake_models.py`;
  - the shipped settings `#molly-settings` and `#comet-settings` (Comet's has no `mn.*`).
- `desktop/`: the Electron app (one copy only, file backups through `window.polyrunner`). The update folder `~/.config/PolyRunner/game` overrides the built-in game. Until desktop app 1.2 (v194) the folders were `~/.config/PolyRun` and `~/PolyRun`; the app never reads them (a one-time script, kept outside the repo, copied Ricky's).
- `tools/`:
  - `mk_pe_embed.py`, `bake_models.py`;
  - `build_release.py` (the offline game zip and desktop zip);
  - `reslice.py` (the sweep's 20 slices).
- `tests/`: the Playwright + swiftshader harness (`righ.py` has the `Rig` class).
- `.github/workflows/release.yml`: publishes under the `<div class="ver">` label when a push to `main` touches the game, `desktop/` or the release tooling.
- `SWEEP-BUGS.md`, `SWEEP-EDGES.md`, `SWEEP-PERF.md`: the three nightly sweeps; their state files and reports go in `sweep-reports/`.
- `GLOSSARY.md`: the one list of terms (what each means, which spelling to use, which names are frozen because they hold saved data). Use it in text, comments and docs; add a term when you introduce one.
- `audit-notes.md`: the long log, frozen on 2026-11-20 (last entry v184); `HISTORY.md` continues it. The `var CHANGELOG` in the game is the player-facing log.

## Characters
- `CHAR` is 'molly' or 'comet' (localStorage `pr_char`), picked on Character Select after a level is chosen (the Characters page only shows the cards); `setChar` switches.
- Stats are stored in `runnerRig2` (Molly, plus the `mn.*` mob stats) and `cometRig` (Comet, never `mn.*`).
- Lookup order is `rigPick`: what's stored, then `SHIPPED[ch]`, then the built-in RIGCFG / COMET_DEF numbers.
- Saved models are in IndexedDB `polyrunner` / `kv` (`polyrun` until v194; v194 copied it across once, removed in v195) under `mollyGlb` and `cometGlb`; `loadCharModel` falls back to the built-in model.
- Comet:
  - Star Throw: Q/E, `starPress` / `starRelease` / `spawnStar` / `cometStars`.
  - Hover and Fly: `hovOn` / `flyOn` / `applyStats`.
  - Poses: stat sets `comet.pc|pt|pf|ho|fl.*`, applied by `cometPose` through the shared `window.__cometQ`.
- The Rig Editor has pages Molly / Comet / Mobs (`setPage`, `loadChar`, `DEFM` / `DEFC`). Copy settings copies `{molly, comet, mobs}`.
- The Rig Editor's preview has two tools (Tools row): Stretch (`stHandles`: dots at the selected part's end or lock tip set Length) and Draw (`drawFit`: a stroke from a lock's root is fitted, by a grid search over the lock's own Length / Extra Curl / Angle, to `HAIRLOCKS[].path`, the lock's centre line in the Head part's space). Either poses her at Rest while on. Test `tests/fu/rigtool1.py`.

## World
- Units: TILE 2 (1 Zip = 2 u/s). Speeds are shown in Zips.
- Every level is a Sandbox layout built from Path Editor JSON by `sbBuild` (spatial hashes `sbHash` / `sbNear`), in its own coordinates, at the origin (`L3_X` is 0). Grass Canyon is `OFFICIAL_L1`, Oceana Crags `OFFICIAL_L2`. `level` is 3 once a layout is loaded (1 before one is picked).
- The old hand-made levels survive only as terrain: a layout's `level1` and `level2` grounds sample them through `oldWorldH` / `oldLedgeH`, in the old levels' own coordinates (Oceana Crags at `L2_X` 30000). `worldH0` and `ledgeH` serve the play world (the loaded layout). Never call `oldWorldH` with play positions or `worldH0` with old-level ones.
- Sunset Hill (ground `sunset`, in `sandbox.js` by the Giant Hill): `shBase` is the hill (48 spokes from the summit, `shTable`, blended Catmull-Rom; they draw together toward the top), `shRavine` the ravines (level lines of a slow field, cutting path and ground alike), `terrainProbe` paints it in the Path Editor. Its own trees are generated per 500-square-unit cell in `trees.js` (`shTrees`, cached per layout), below `SH_TREES` of the summit's height and 6 units clear of paths (`l3Ed`). The sky dome (`skyDome`, `scene.js`) and orange fog are switched on in `loop.js` for this ground only. Test: `tests/fu/sunset1.py`.
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
- After every edit to `src/`: `python3 tools/build.py && python3 tests/chk.py && python3 tests/mk_test.py` (`chk.py` fails if the game file is out of sync with `src/`). Then run only the tests for the area touched (map in any SWEEP-*.md), from inside `tests/`.
- Tests under `tests/fu/` are per-feature; run one only when touching that feature.
- Old build for comparison: `python3 tests/mk_test.py OLD.html /tmp/polyrun-work/t/aud_main.html`, then pass `html='aud_main.html'` to `Rig()`. (Tests that needed missing comparison builds were removed in v190.)
- Keep scratch backups in `/tmp`, never in the repo.

## Docs
- `README.md`: what it is, run, test, updating, files.
- `src/manifest.json`: the build's output name and part list.
- `CLAUDE.md`: working rules for sessions (Ricky approves edits).
- `ARCHITECTURE.md`: this file.
- `HANDOFF.md`: current state; overwritten each time.
- `BACKLOG.md`: open bugs and ideas (the nightly sweeps append their suggestions here).
- `HISTORY.md`: append-only record of every change since 2026-11-20; not read unless Ricky asks. The nightly sweeps add their own line each night.
- `SWEEP-BUGS.md`, `SWEEP-EDGES.md`, `SWEEP-PERF.md`, `sweep-reports/`: the nightly sweeps (see Files).
- `audit-notes.md`: frozen long log (see Files). `desktop/README.md`: the desktop app.
