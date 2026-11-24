# Handoff (2026-11-23)

## Goal
Level 3: Sunset Hill, Act 1 (Comet's level). Step 1: its ground, trees and sky, as a Path Editor ground Ricky builds the layout on.

## Done (published as v192)
- New ground `sunset` (Path Editor: "Sunset Hill"): the Giant Hill's footprint (radius 9,000, summit 3,000), slope wandering from about 3 to 45 degrees (`shBase`, 48 spokes via `shTable`), plus small bumps.
- Ravines (`shRavine`): about 60 wide and 60 deep (each varies about 30%), about 9% of the hill. They cut through paths (Ricky: no land bridges); a floating piece can span one. Ravine floors and walls are rock.
- Trees of its own (`shTrees` in `trees.js`): about one per 1,000 square units in clumps, none within 6 units of a path, in ravines or lakes; thin out and stop at 2/3 of the summit's height (`SH_TREES`).
- Sunset sky: `skyDome` (pale blue top to deep orange horizon), fog orange, on this ground only. Hillside up to about 40 degrees stays grass (other grounds unchanged).
- Path Editor paints the ground (slope shading, ravines grey, paler grass above the treeline) when run inside the game.
- Test `tests/fu/sunset1.py`. Hooks `__shDbg`, `__treeDbg`. lvprobe vs v191: official levels' ground identical.

## In progress
Nothing half-done. v192 published; waiting for Ricky's look.

## Decisions
- Ricky: treeline is by height (2/3 of the summit's), not distance; ravines never bridged by paths.
- Ravine walls are too steep to climb (about 75 degrees): a fall in means running out along it. Steepest hillside is right at her climb limit (CLIMB_SLOPE 1.05).

## Next steps
1. Ricky tries the ground in the Path Editor / Sandbox; tune numbers at the top of the Sunset Hill block in `sandbox.js` (SH_*).
2. Later: an official layout slot (`OFFICIAL_L3`) once Ricky builds it.

## Gotchas
- `shBase`/`shRavine` take Sandbox coordinates (subtract `L3_X`, which is 0).
- `l3Ed` (distance outside the nearest path edge) is set by every `level3H` read.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
- Wall-time checks are noisy here; lvprobe's Level 1 run distance differed (ground identical).
