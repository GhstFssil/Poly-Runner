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

## Nightly sweep suggestions
Suggestions the sweep may not act on (features, physics, tuning, looks, design) are written in `sweep-reports/` and can be promoted here when Ricky approves them.

## Done recently
See the CHANGELOG at the top of `var CHANGELOG` in `checker-run.html`.
