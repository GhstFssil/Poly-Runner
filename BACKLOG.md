# Backlog
Open work only, in focused groups. Ricky decides priority and version numbers (see CLAUDE.md). Either of us adds items. Delete an item when it's done (HISTORY.md records the change; add a CHANGELOG entry too if players see it). Items marked **Decision** need Ricky's answer first.
Format for new entries: `- [ ] (who, YYYY-MM-DD) short description; where/how to reproduce`. The sweeps tag theirs `(nightly/<name>)`. Older entries below have no who or date.

## Characters and looks
- [ ] Runner model faceting should be mirrored down the center line. (Claude, 2026-11-25) Mostly done on `next`: limbs, hair and shading match; still not mirrored: the welded shoulders and hips (the weld cut differs side to side) and the strips straddling the centre line (front/back middle, ponytail). Review with Ricky.
- [ ] (Ricky, 2026-11-23) Give comet her own hair (ringlet curls)
- [ ] (Ricky, 2026-11-23) Add special assets for the faces (eyes, mouth, nose).

## Editor tools
- [ ] Add a save to game button on the mobs tab.
- [ ] Option for terrain stamps with heights to "Supersede", which cuts any other terrain or stamps touching them flat to their bottom where they touch.
- [ ] (Ricky, 2026-11-24) Possibility of having a draw/stretch tool in the path/rig editor? Draw could create chained segments of objects and stretch could adjust the position of points.

## New mechanics (design first)
- [ ] Wind: Placed kind of the same way as tunnels, but it has no collision, it's just an area that gives the runner a directional acceleration. The acceleration can be set in any direction including up/down. Should have some subtle and unobtrusive visual indicator
- [ ] Paths that curve into walls need to be easier to follow somehow. If you don't aim pixel perfect you risk shooting off the edge at high speeds. **Decision**: guide visual, aim assist, or other (no physics changes for level problems).

## Infrastructure
- [ ] (Ricky, 2026-11-22) Tavern and Update Buttons:
  - Step 1: Set up the subdomain with the GitHub page, and have it open a downloads menu for the game assets. Should have the same background as the menu inside the game.
  - Step 2: Add an Update button to the main menu, just above the Changes button, which fetches the version release files from the page, unzips, and merges the "game" file into the game's .config file automatically, then refreshes.
- [ ] (Ricky, 2026-11-24) Installing the game works fine, but throws warnings about unsupported and deprecated tools. Should we make sure we're using supported tools or current versions of them?

## Nightly sweep suggestions
Questions and suggestions the sweep may not act on (possible bugs that might be intended, features, physics, tuning, looks, design) are appended below by the sweep itself, one line each, tagged with the night's branch; details are in that night's report in `sweep-reports/`. Ricky promotes or deletes them.
