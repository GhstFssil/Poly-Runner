# Backlog
Open work only, in focused groups. Ricky decides priority and version numbers (see CLAUDE.md). Either of us adds items. Delete an item when it's done (HISTORY.md records the change; add a CHANGELOG entry too if players see it). Items marked **Decision** need Ricky's answer first.
Format for new entries: `- [ ] (who, YYYY-MM-DD) short description; where/how to reproduce`. The sweeps tag theirs `(nightly/<name>)`. Older entries below have no who or date.

## Unsorted
- [ ] Runner model faceting should be mirrored down the center line.
- [ ] Option for terrain stamps with heights to "Supersede", which cuts any other terrain or stamps touching them flat to their bottom where they touch.
- [ ] Paths that curve into walls need to be easier to follow somehow. If you don't aim pixel perfect you risk shooting off the edge at high speeds.
- [ ] Wind: Placed kind of the same way as tunnels, but it has no collision, it's just an area that gives the runner a directional acceleration. The acceleration can be set in any direction including up/down. Should have some subtle and unobtrusive visual indicator
- [ ] Add a save to game button on the mobs tab.

## Separate track: split the game into source files and rename to Poly Runner
(Discussed 2026-11-16; Ricky backs up saves first. Best done after groups 1-2 so those fixes aren't mixed into the move.)
- [ ] (Step 1 done 2026-11-21: data is in src/data/.) Split `checker-run.html` into `src/` files plus `tools/build.py`, which joins them back into one shipped HTML file (same idea as `mk_pe_embed.py`). Suggested layout: `src/index.html`, `style.css`; `src/game/` cut at the existing `// ----` headers (areas, named as in GLOSSARY.md: core, level1, level2, sandbox, characters, mobs, ui); `src/rig-editor/`; `src/path-editor/`; `data/` with real `molly.glb` / `comet.glb`, the two settings JSONs, `grass-canyon.json` (`OFFICIAL_L1`) and `changelog.json`. Do it in steps on `next`, tests after each: models and data, then editors, then the main script.
  - Risk: none to saves (they are not in the game file). Watch for: the main script is one closure with shared variables, so the pieces must be joined in order without code changes; separate script/module files won't load from `file://`. Tests, `bake_models.py`, `mk_pe_embed.py`, `reslice.py`, `build_release.py` and the sweeps' slicing all assume the single file and need updating.
- [ ] Rename the visible names to Poly Runner: file names (`checker-run.html` -> `poly-runner.html`), titles, menu text, docs, tools and test paths ("Poly Run", "Polyrunner", "checker-run"). The build's output name is `output` in `src/manifest.json`; other places that name the file: `tools/` (`build_release.py`, `mk_electron.py`, `reslice.py`), `tests/` (`chk.py`, `mk_test.py`), `.github/workflows/release.yml` paths, the docs.
  - Risk: low. The desktop app always loads `game/index.html`, and Chrome shares storage across local files, so saves still show. **Firefox may treat a renamed local file as a separate site and open with empty saves** (the old file keeps them).
- [ ] (Optional) Rename the hidden saved-data names: IndexedDB `polyrun`, localStorage keys (`pr_char`, `pr_gfx`, `pr_mouse`, the rig stat stores), `~/.config/PolyRun` (desktop storage and the update folder), `~/PolyRun/layouts` backups, and `window.polyrun` / `polyrun-*` IPC.
  - **Risk: high if done without migration. The game would look in the new names, find nothing, and start fresh; saves would look lost (still on disk, but only recoverable by hand).** Not corruption, but easy to mistake for it.
  - If done: copy, never move (fill the new names only when empty, leave the old data untouched); the desktop app copies `~/.config/PolyRun` before the game starts; test the migration with fake saves in the harness; Ricky backs up `~/.config/PolyRun` and `~/PolyRun` first.
  - Zero-risk alternative (recommended): keep these names as they are; players never see them.

## Nightly sweep suggestions
Questions and suggestions the sweep may not act on (possible bugs that might be intended, features, physics, tuning, looks, design) are appended below by the sweep itself, one line each, tagged with the night's branch; details are in that night's report in `sweep-reports/`. Ricky promotes or deletes them.
- [ ] (Claude, 2026-11-21) `tools/mk_sweep_docs.py` is behind the three SWEEP-*.md docs (they were edited by hand on 2026-11-20: the HISTORY.md lines, the version wording), so `--check` fails and running it would delete those lines. Sync the generator from the docs, or retire it. Also carry over the 2026-11-21 wording change (dial -> stat).
- [ ] (Claude, 2026-11-21) Tests: `tests/fu/door4.py` fails at s=98, 20 Zips (goes past the far face by 0.54) on the build before the Mob rename too, so it is older than that change. `tests/fu/minionhit.py` fails about half its runs on both builds (the "on wall" check is timing-dependent). Neither comes from the Mob rename.
