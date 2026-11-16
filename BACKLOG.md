# Poly Runner backlog

Open work only. Ricky decides priority and version numbers (see CLAUDE.md). Move finished items into the CHANGELOG and `audit-notes.md`, then delete them here.

## Needs a decision from Ricky
(From the v173 audit.)
- [ ] Grip stat is in units/s^2 (40) while everything else is in Zips; the card shows it /2. Convert the slider to Zips/s^2?
- [ ] Grip does not fade with slope on ordinary ground but does on walls (jump at 80 degrees). Fade everywhere (grip x cos slope)?
- [ ] Gap/ledge/platform ends are round in the game and square in the editor. Make the game square? (His tuned jumps get about 29 units shorter.)
- [ ] Gravity as an editable stat?
- [ ] Ledges, hills and trapped-minion pits placed on a path that is a deck over low ground on Oceana do not show.

## Bugs
(none open)

## Ideas
- [ ] Performance: big toxic patches mesh at up to 300x300 cells (`max(2.5, size/300)` in `sbMakeMeshes`), each vertex calling `sbFoot`. Cap at about 32-64 cells a side (looks the same on flat ground).
- [ ] Performance: fewer bubbles for toxic patches farther from Molly, or a lower overall cap than 800 in `sbToxBubbles`.
- [ ] Performance: toxic terrain-patch and toxic-ledge bubbles still call `groundH` for every bubble every frame; cache their base heights the way toxic patches now do (`t.bub`).

### Split the game into source files and rename to Poly Runner (discussed 2026-11-16; Ricky backs up saves first)
- [ ] Split `checker-run.html` into `src/` files plus `tools/build.py`, which joins them back into one shipped HTML file (same idea as `mk_pe_embed.py`). Suggested layout: `src/index.html`, `style.css`; `src/game/` cut at the existing `// ----` headers (core, level1-valley, level2-crags, sandbox, runner-molly, runner-comet, enemies, hud); `src/rig-editor/`; `src/path-editor/`; `data/` with real `molly.glb` / `comet.glb`, the two settings JSONs, `grass-canyon.json` (`OFFICIAL_L1`) and `changelog.json`. Do it in steps on `next`, tests after each: models and data, then editors, then the main script.
  - Risk: none to saves (they are not in the game file). Watch for: the main script is one closure with shared variables, so the pieces must be joined in order without code changes; separate script/module files won't load from `file://`. Tests, `bake_models.py`, `mk_pe_embed.py`, `reslice.py`, `build_release.py` and SWEEP.md's line-range map all assume the single file and need updating.
- [ ] Check whether the old hand-built character code (Character / Head / Arms / Legs sections, about 750 lines) is still used now that the runners are .glb models; drop it before splitting if not.
- [ ] Rename the visible names to Poly Runner: file names (`checker-run.html` -> `poly-runner.html`), titles, menu text, docs, tools and test paths ("Poly Run", "Polyrunner", "checker-run").
  - Risk: low. The desktop app always loads `game/index.html`, and Chrome shares storage across local files, so saves still show. **Firefox may treat a renamed local file as a separate site and open with empty saves** (the old file keeps them).
- [ ] (Optional) Rename the hidden saved-data names: IndexedDB `polyrun`, localStorage keys (`pr_char`, `pr_gfx`, `pr_mouse`, the rig dial stores), `~/.config/PolyRun` (desktop storage and the update folder), `~/PolyRun/layouts` backups, and `window.polyrun` / `polyrun-*` IPC.
  - **Risk: high if done without migration. The game would look in the new names, find nothing, and start fresh; saves would look lost (still on disk, but only recoverable by hand).** Not corruption, but easy to mistake for it.
  - If done: copy, never move (fill the new names only when empty, leave the old data untouched); the desktop app copies `~/.config/PolyRun` before the game starts; test the migration with fake saves in the harness; Ricky backs up `~/.config/PolyRun` and `~/PolyRun` first.
  - Zero-risk alternative (recommended): keep these names as they are; players never see them.

## Nightly sweep suggestions
Suggestions the sweep may not act on (features, physics, tuning, looks, design) are written in `sweep-reports/` and can be promoted here when Ricky approves them.

## Done recently
See the CHANGELOG at the top of `var CHANGELOG` in `checker-run.html`.
