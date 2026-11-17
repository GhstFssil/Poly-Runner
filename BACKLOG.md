# Poly Runner backlog

Open work only, in focused groups. Ricky decides priority and version numbers (see CLAUDE.md). Move finished items into the CHANGELOG and `audit-notes.md`, then delete them here. Items marked **Decision** need Ricky's answer first.

## 1. Level geometry and collision
- [ ] **Decision:** in a sloped tunnel Molly stands above the drawn floor (about 0.5 at 20°, 1.6 at 35°): the collision floor uses cos(angle) × half its height where the drawn cross-section gives half its height ÷ cos(angle). Make collision match the drawing?
- [ ] **Decision:** at the bottom of a narrow cone she now lands, but the slope pull on the steep ground there still creeps her slightly (under 1 unit every 5 s). Treat the very bottom as flat (no slope pull there)?
- [ ] Check how the joint between two caves of different angles looks: the floor now eases across it for Molly, but the drawn tunnels still meet at their own end sections.

## 2. Molly's stats and enemies
- [ ] **Decision:** grip stat is in units/s^2 (40) while everything else is in Zips; the card shows it /2. Convert the slider to Zips/s^2?
- [ ] **Decision:** grip does not fade with slope on ordinary ground but does on walls (jump at 80 degrees). Fade everywhere (grip x cos slope)?
- [ ] **Decision:** gravity as an editable stat?
- [ ] Grip during drift should be an editable stat.
- [ ] Big minions: push Molly back when they hit her, not up (bug and idea are the same change); longer cooldown before they can hit her after they've been damaged; their heads shouldn't hurt to touch.
- [ ] Minions can push Molly straight up a wall.
- [ ] Dev mode: an "invulnerable mode" option where Molly can't be hurt or pushed by enemies.
- [ ] Hedron barrier should lean on slopes like Molly's body does.

## 3. Editor and UI polish
- [ ] Path editor: the buttons squish the level name so it can barely be read. They should be much narrower.
- [ ] Path editor: curve angle and curve radius should only affect each other, not the length.
- [ ] Paths: supersede terrain should be the default (Ricky uses it far more often).
- [ ] When the level is a lot to load, the cursor doesn't always lock.
- [ ] Screens like dev mode and characters should show the checkerboard background of the main menu.
- [ ] Being underwater should make everything look blue.

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
