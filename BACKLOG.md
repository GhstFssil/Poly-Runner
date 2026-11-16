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
- [ ] Path Editor: editing the "next ledge" field (the next-stamp settings) does not change the ledge before it is placed, so ledges have to be edited after placing.
- [ ] Characters: the top of the card is cut off on the screen.
- [ ] Editor: Big Minions: Remove the "trapped in a pit" placement option, and placement options in general.
- [ ] Gameplay: Being stopped by a wall doesn't always stop forward momentum, sometimes causing the runner to become stuck and then launch off of it.

## Ideas
- [ ] Path Editor: make the next-stamp fields always match what is editable when the placed stamp is selected (same fields, same order, for every stamp kind).
- [ ] Rig Editor: Add strafe distance to editable stats.
- [ ] Rig Editor: add heading to caves.

## Nightly sweep suggestions
Suggestions the sweep may not act on (features, physics, tuning, looks, design) are written in `sweep-reports/` and can be promoted here when Ricky approves them.

## Done recently
See the CHANGELOG at the top of `var CHANGELOG` in `checker-run.html`.
