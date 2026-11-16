# Poly Runner backlog

Open work only. Ricky decides priority and version numbers (see CLAUDE.md). Move finished items into the CHANGELOG and `audit-notes.md`, then delete them here.

## Needs a decision from Ricky
- [ ] Does the runner ever look flat red and stippled near the camera in the real game? It does in headless renders, and in pre-v179 builds too. Suspect: the see-through shader. (From HANDOFF.md)

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
