# Handoff (2026-11-23)

## Goal
Each level in its own coordinate space. Done: the old hand-made levels are gone (only their terrain is left), and layouts play at the origin.

## Done (on `next`, not published)
- Removed the old levels' mobs, checkpoints, goal, tips, maps, scenery, collision and Segs (`core/checkpoints.js` and `level1/cave-roof.js` gone). No code checks for level 1 or 2.
- Play space at the origin (`L3_X` 0, `L3_MIN` gone). The play world's ground, ledges and mud (`worldH0`, `ledgeH`, `mudAt`) always come from the loaded layout; the old levels' terrain is sampled only through `oldWorldH` / `oldLedgeH`, in their own coordinates.
- Fix found by the full suite: `spawnAt` reads the ground without her old height (`sbFoot`); otherwise starting Oceana from the title put her in the sea.
- Tests use 0 instead of 60000. `tests/lvprobe.py`: smoke probe (ground, slope, mud on a grid in level-local coordinates; a short run; start screenshots).
- Full suite run on this build and on v190 (with v190's own tests) and compared: no other differences beyond run-to-run noise. ARCHITECTURE.md and GLOSSARY.md updated (play world, old levels).

## In progress
Nothing half-done. Waiting on Ricky: publish as v191?

## Decisions
- Ricky: delete the old levels and keep only their terrain; levels get separate coordinate spaces; 2-3 smoke tests per commit, full suite at the end.
- `CP2_X`/`CP2_Z` stay in `trees.js` because the terrain's mounds read them.
- `L3_X` is kept (0) rather than removed from ~90 places: a mechanical cleanup for later if wanted.

## Next steps
1. Publish when Ricky says: bump the label to v191 with a CHANGELOG entry ("Behind the scenes": the old built-in levels are gone and levels play at the origin; nothing in the game changes), merge `next` into `main`.
2. Optional: drop `L3_X`; move the old levels' terrain into a `terrain` area; rename to Poly Runner (BACKLOG).

## Gotchas
- Old-level terrain functions take old coordinates; never pass play positions to `oldWorldH`, or old ones to `worldH0`.
- `groundH` uses her feet when she is within 8 units of the point (overpasses). To read the ground somewhere she is about to be, use `sbFoot`.
- Wall-time checks are noisy here (frame rate swings 4-50 fps): `deckstamp`'s run, lvprobe's run distance and many INFO tests vary run to run on v190 too.
- Several tests need arguments or files from earlier sessions (`rv6`-`rv8`, `rw4`, `rx2`, `rba*`, `rh2`, `rm1`, `ends3`, `ends4`, `fu1c`, `lay1`, `steep2`, `steep5`): they fail the same on v190.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
