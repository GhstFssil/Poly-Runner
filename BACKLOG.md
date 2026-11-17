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
- [ ] Gameplay: Molly gets stuck falling/sliding forever when falling into a cone-shaped hole.
- [ ] Changing the rotation of a shaft changes the angle of the caves chained to it on the editor screen, but not in the game.
- [ ] Big minions should push you away when they hit you, and they should have a longer cooldown to hit you after they've been damaged themselves. Also, their heads shouldn't hurt to touch.
- [ ] The buttons on the path editor screen squish the level name so it can barely be read. They should be much narrower.
- [ ] Molly gets stuck on the threshold between joined caves of different angles. Needs to be smoothed out.
- [ ] Molly's Y value using show coordinates doesn't match Oceana Crags' true Y.
- [ ] On a path, curve angle and curve radius should only affect each other, not the length.
- [ ] Door collision. See Oceana Crags update.
- [ ] Minions can push Molly straight up a wall.
- [ ] When the level is a lot to load, the cursor doesn't always lock.
- [ ] Toxic terrain doesn't produce visible bubbles at all

## Ideas
- [ ] Being underwater should make everything look blue.
- [ ] Dev mode should include an "invulnerable mode" option where Molly can't be hurt or pushed by enemies.
- [ ] Screens like dev mode and characters should show the checkerboard background of the main menu.
- [ ] For paths, supersede terrain should be the default because I use it far more often.
- [ ] Reduce the number of bubbles toxic patches produce to 25% of what they are now.
- [ ] Grip during drift should be an editable stat
- [ ] Hedron barrier should lean on slopes like Molly's body does
- [ ] Big Minions should toss Molly back, not up.

## Nightly sweep suggestions
Suggestions the sweep may not act on (features, physics, tuning, looks, design) are written in `sweep-reports/` and can be promoted here when Ricky approves them.

## Done recently
See the CHANGELOG at the top of `var CHANGELOG` in `checker-run.html`.
