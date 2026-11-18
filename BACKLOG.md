# Poly Runner backlog

Open work only, in focused groups. Ricky decides priority and version numbers (see CLAUDE.md). Move finished items into the CHANGELOG and `audit-notes.md`, then delete them here. Items marked **Decision** need Ricky's answer first.

## 2. Molly's stats and enemies
- [ ] New Mob: Roost Gazer. Flying. It looks like a little minion head with tiny legs, wings, and one big eye in the center with a distinct pupil. Can be set to chase, idle, or cycle. Cycle has it move in a set pattern like a floating platform would. When it chases, it simply attempts to buzz around the runner's head in a 10 unit radius. Has collision, but touching it does no damage. Within 30 units, it can shoot a laser at the target every 2 seconds, which does half a heart of damage.
- [ ] A half heart looks like a heart that's cracked down the middle on the UI.

## 3. Editor and UI polish
- [ ] Path editor: the buttons squish the level name so it can barely be read. They should be much narrower.
- [ ] Path editor: curve angle and curve radius should only affect each other, not the length.
- [ ] Paths: supersede terrain should be the default (Ricky uses it far more often).
- [ ] When the level is a lot to load, the cursor doesn't always lock.
- [ ] Screens like dev mode and characters should show the checkerboard background of the main menu.
- [ ] Being underwater should make everything look blue.
- [ ] Path labels should be in the middle, and the individual path fields should be collapsible and collapsed by default so they don't clutter the UI.

## Unsorted
- [ ] Runner model faceting should be mirrored down the center line.
- [ ] Option for terrain stamps with heights to "Supersede", which cuts any other terrain or stamps touching them flat to their bottom where they touch.
- [ ] Paths that curve into walls need to be easier to follow somehow. If you don't aim pixel perfect you risk shooting off the edge at high speeds.
- [ ] Wind: Placed kind of the same way as tunnels, but it has no collision, it's just an area that gives the runner a directional acceleration.

## Separate track: split the game into source files and rename to Poly Runner
(Discussed 2026-11-16; Ricky backs up saves first. Best done after groups 1-2 so those fixes aren't mixed into the move.)
- [ ] Check whether the old hand-built character code (Character / Head / Arms / Legs sections, about 750 lines) is still used now that the runners are .glb models; drop it before splitting if not.
- [ ] Split `checker-run.html` into `src/` files plus `tools/build.py`, which joins them back into one shipped HTML file (same idea as `mk_pe_embed.py`). Suggested layout: `src/index.html`, `style.css`; `src/game/` cut at the existing `// ----` headers (core, level1-valley, level2-crags, sandbox, runner-molly, runner-comet, enemies, hud); `src/rig-editor/`; `src/path-editor/`; `data/` with real `molly.glb` / `comet.glb`, the two settings JSONs, `grass-canyon.json` (`OFFICIAL_L1`) and `changelog.json`. Do it in steps on `next`, tests after each: models and data, then editors, then the main script.
  - Risk: none to saves (they are not in the game file). Watch for: the main script is one closure with shared variables, so the pieces must be joined in order without code changes; separate script/module files won't load from `file://`. Tests, `bake_models.py`, `mk_pe_embed.py`, `reslice.py`, `build_release.py` and the sweeps' slicing all assume the single file and need updating.
- [ ] Make a glossary of the game's terms, then standardize the terminology in both the code and the labels (editor fields, saved layout keys, menus, docs). Example: free toxic patches and other stamps turn with `rot` ("Rotation"), while strip stamps (ledges, mud, platforms, gaps, Seg chains) turn with `heading`, for the same thing. **Ricky makes the call on which term wins wherever two terms or definitions conflict**: list each conflict with where it's used and wait for his choice. Renaming saved layout keys needs the old names still read on load, so existing layouts keep working.
- [ ] Rename the visible names to Poly Runner: file names (`checker-run.html` -> `poly-runner.html`), titles, menu text, docs, tools and test paths ("Poly Run", "Polyrunner", "checker-run").
  - Risk: low. The desktop app always loads `game/index.html`, and Chrome shares storage across local files, so saves still show. **Firefox may treat a renamed local file as a separate site and open with empty saves** (the old file keeps them).
- [ ] (Optional) Rename the hidden saved-data names: IndexedDB `polyrun`, localStorage keys (`pr_char`, `pr_gfx`, `pr_mouse`, the rig dial stores), `~/.config/PolyRun` (desktop storage and the update folder), `~/PolyRun/layouts` backups, and `window.polyrun` / `polyrun-*` IPC.
  - **Risk: high if done without migration. The game would look in the new names, find nothing, and start fresh; saves would look lost (still on disk, but only recoverable by hand).** Not corruption, but easy to mistake for it.
  - If done: copy, never move (fill the new names only when empty, leave the old data untouched); the desktop app copies `~/.config/PolyRun` before the game starts; test the migration with fake saves in the harness; Ricky backs up `~/.config/PolyRun` and `~/PolyRun` first.
  - Zero-risk alternative (recommended): keep these names as they are; players never see them.

## Nightly sweep suggestions
Questions and suggestions the sweep may not act on (possible bugs that might be intended, features, physics, tuning, looks, design) are appended below by the sweep itself, one line each, tagged with the night's branch; details are in that night's report in `sweep-reports/`. Ricky promotes or deletes them.

## Done recently
See the CHANGELOG at the top of `var CHANGELOG` in `checker-run.html`.
