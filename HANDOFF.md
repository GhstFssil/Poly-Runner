# Handoff (2026-11-23)

## Goal
Each level in its own coordinate space. Both official levels already load as Sandbox layouts (`startSandbox(OFFICIAL_L1/L2)`, `level = 3`, played at `L3_X` = 60000) in level-local coordinates, so the work is: delete the old hand-made levels, then move the play space to the origin.

## Done (on `next`, not published)
- Confirmed with counters on every level check: once a level is picked, no `level === 1/2` branch runs (the old mobs and Segs only ticked on the menus).
- Deleted the old hand-made levels' gameplay and scenery: mobs, checkpoints (`core/checkpoints.js` gone), goal, Bonus Goal, built-in tips, world maps and their buttons, signs, rock, cave roof and door (`level1/cave-roof.js` gone), toxic strips, bridge, the Sink, auto-placed trees and Seg lines, barriers. No code checks for level 1 or 2 now.
- Kept every terrain function (Grass Canyon's valley/plateau/cave, Oceana's crags and path), since the `level1`/`level2` terrain kinds sample them.
- `tests/lvprobe.py`: smoke probe (ground, slope, mud on a grid in level-local coordinates, a short run, start screenshots). Baseline from v190: `/tmp/polyrun-work/probe_base.json` (rebuild it from `git show b35f068:checker-run.html` if /tmp was cleared).

## In progress
Nothing half-done.

## Decisions
- Ricky: delete the old levels and keep only their terrain; levels get separate coordinate spaces.
- Ricky: during this work, 2-3 smoke tests per commit (lvprobe, `fu/deckstamp.py`, `fu/cavejoin.py`); the full suite once at the end, before asking about publishing.
- `CP2_X`/`CP2_Z` stay in `trees.js` because the terrain's mounds read them (moving them could change terrain).

## Next steps
1. Move the play space to the origin: `L3_X` 60000 -> 0, and replace the x-range dispatch (`x > L3_MIN`, `x > L2_MIN` in `groundH`, `worldH0`, chunks, mud, ledges) so the old worlds' terrain is only sampled through `sbTerrBase`. Tests that place Molly at 60000 need updating. Check Sandbox saves store stamps relative to `L3_X` (they appear to).
2. Run the full suite; re-run any failures on v190 to see which already failed.
3. Update ARCHITECTURE.md and GLOSSARY.md (areas: `level1/` and `level2/` are now terrain), then ask Ricky about publishing.

## Gotchas
- Wall-time checks are noisy here (frame rate swings from 4 to 50 fps): `deckstamp`'s run and lvprobe's run distance can fail with no code change. Re-run before suspecting the change.
- A lint check catches names used but no longer defined: eslint `no-undef` on the last `<script>` block of the built file (setup is outside the repo).
- `showHint` ignores everything without `force`; the built-in tips were already off.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` in the repo root; don't commit it.
