# Backlog
Open work only, in focused groups. Ricky decides priority and version numbers (see CLAUDE.md). Either of us adds items. Delete an item when it's done (HISTORY.md records the change; add a CHANGELOG entry too if players see it). Items marked **Decision** need Ricky's answer first.
Format for new entries: `- [ ] (who, YYYY-MM-DD) short description; where/how to reproduce`. The sweeps tag theirs `(nightly/<name>)`. Older entries below have no who or date.

## Unsorted
- [ ] Runner model faceting should be mirrored down the center line.
- [ ] Option for terrain stamps with heights to "Supersede", which cuts any other terrain or stamps touching them flat to their bottom where they touch.
- [ ] Paths that curve into walls need to be easier to follow somehow. If you don't aim pixel perfect you risk shooting off the edge at high speeds.
- [ ] Wind: Placed kind of the same way as tunnels, but it has no collision, it's just an area that gives the runner a directional acceleration. The acceleration can be set in any direction including up/down. Should have some subtle and unobtrusive visual indicator
- [ ] Add a save to game button on the mobs tab.
- [ ] (Ricky, 2026-11-22) Tavern and Update Buttons:
  - Step 1: Set up the subdomain with the GitHub page, and have it open a downloads menu for the game assets. Should have the same background as the menu inside the game.
  - Step 2: Add an Update button to the main menu, just above the Changes button, which fetches the version release files from the page, unzips, and merges the "game" file into the game's .config file automatically, then refreshes.
- [ ] (Ricky, 2026-11-23) Give comet her own hair (ringlet curls)
- [ ] (Ricky, 2026-11-23) Give fine-grained control of hair.
- [ ] (Ricky, 2026-11-23) Add special assets for the faces (eyes, mouth, nose).
- [ ] (Ricky, 2026-11-23) Character select should be a choice each time after selecting a level to play, not a switch that must be flipped on the characters page.
- [ ] (Ricky, 2026-11-23) Comet's hover animation should be more of a standing-style animation, not a running-style animation.
- [ ] (Ricky, 2026-11-23) Sidestep. The character moves to the left or right relative to the character's heading and independent of the camera; left mouse and right mouse buttons, respectively.
- [ ] (Ricky, 2026-11-23) Scroll wheel on the mouse moves the camera in or out. Camera also moves out slightly as you go faster.
- [ ] (Ricky, 2026-11-23) Caps lock allows you to move the camera without changing the character's heading.
- [ ] (Ricky, 2026-11-23) Star throw's angle is too low.
- [ ] (Ricky, 2026-11-23) Big star when flying should be tilted horizontal compared to its orientation when it's on her back.
- [ ] (Ricky, 2026-11-24) Possibility of having a draw/stretch tool in the path/rig editor? Draw could create chained segments of objects and stretch could adjust the position of points.

## Separate track: rename to Poly Runner (the source split is done)
(Discussed 2026-11-16; Ricky backs up saves first. Best done after groups 1-2 so those fixes aren't mixed into the move.)
- [ ] (Ricky, 2026-11-24) Rename the hidden saved-data names, with a migration (names decided: GLOSSARY.md, Frozen names). Shipped together with the visible rename (done on `next` 2026-11-24) as one version. Commit 2: browser storage; commit 3: the desktop app (it copies `~/.config/PolyRun` before the game starts, since Electron keeps the saves there).
  - **Risk: high if done without migration. The game would look in the new names, find nothing, and start fresh; saves would look lost (still on disk, but only recoverable by hand).** Not corruption, but easy to mistake for it.
  - If done: copy, never move (fill the new names only when empty, leave the old data untouched); the desktop app copies `~/.config/PolyRun` before the game starts; test the migration with fake saves in the harness; Ricky backs up `~/.config/PolyRun` and `~/PolyRun` first.

## Nightly sweep suggestions
Questions and suggestions the sweep may not act on (possible bugs that might be intended, features, physics, tuning, looks, design) are appended below by the sweep itself, one line each, tagged with the night's branch; details are in that night's report in `sweep-reports/`. Ricky promotes or deletes them.
- [ ] (Claude, 2026-11-21) `tools/mk_sweep_docs.py` is behind the three SWEEP-*.md docs (they were edited by hand on 2026-11-20: the HISTORY.md lines, the version wording), so `--check` fails and running it would delete those lines. Sync the generator from the docs, or retire it. Also carry over the 2026-11-21 wording change (dial -> stat).
