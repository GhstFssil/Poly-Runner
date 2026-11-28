# Backlog
Open work only, in focused groups. Ricky decides priority and version numbers (see CLAUDE.md). Either of us adds items. Delete an item when it's done (HISTORY.md records the change; add a CHANGELOG entry too if players see it). Items marked **Decision** need Ricky's answer first.
Format for new entries: `- [ ] (who, YYYY-MM-DD) short description; where/how to reproduce`. The sweeps tag theirs `(nightly/<name>)`. Older entries below have no who or date.

## Characters and looks
- [ ] Runner model faceting should be mirrored down the center line. (Claude, 2026-11-27) Done on `next` except: the shipped torso bulges are not mirror pairs (Lower Torso 154/-155 and widths 50/51; Upper Torso start/end widths 0.16/0.31 vs 0.2/0.2), so the welds fall back to the old way until Mirror Bulge 1 is on for both torso parts (Ricky's call: it changes her shape a little). With it on, 48 of 3776 facets are left, all hair (the locks at the head and the ponytail top). Review with Ricky.
- [ ] (Ricky, 2026-11-23) Add special assets for the faces (eyes, mouth, nose).

## Editor tools
- [ ] (Claude, 2026-11-25) Supersede for Ledges too? Hill and Crags have it; a ledge's bottom follows the ground along its length, so "flat to its bottom" needs a rule (its start's height, or follow the ground). **Decision** (Ricky).

## New mechanics (design first)
- [ ] Wind: Placed kind of the same way as tunnels, but it has no collision, it's just an area that gives the runner a directional acceleration. The acceleration can be set in any direction including up/down. Should have some subtle and unobtrusive visual indicator

- [ ] (Ricky, 2026-11-27) Comet should have Lock Heading too. (Claude, 2026-11-27) Her own Faceplant is in on `next`, so this is unblocked.

## Infrastructure
- [ ] (Ricky, 2026-11-22) Tavern and Update Buttons:
  - Step 1: Set up the subdomain with the GitHub page, and have it open a downloads menu for the game assets. Should have the same background as the menu inside the game.
  - Step 2: Add an Update button to the main menu, just above the Changes button, which fetches the version release files from the page, unzips, and merges the "game" file into the game's .config file automatically, then refreshes.
- [ ] (Ricky, 2026-11-24) Installing the game works fine, but throws warnings about unsupported and deprecated tools. Should we make sure we're using supported tools or current versions of them?

## Nightly sweep suggestions
Questions and suggestions the sweep may not act on (possible bugs that might be intended, features, physics, tuning, looks, design) are appended below by the sweep itself, one line each, tagged with the night's branch; details are in that night's report in `sweep-reports/`. Ricky promotes or deletes them.
