# Handoff (2026-11-27)

## Goal
Session 2026-11-27 pm: spine facets mirrored, then Rig Editor Stretch and Draw (hair). All on `next`, not published (CHANGELOG entry v199 ready; label still v198).

## Done
- Spine facets: `diagPick` breaks full ties by sum |x|*y, then z*y (an upright tube's side quads tied on |x|, height and depth, so both sides kept the builder's diagonal). Spine 24 -> 0. With Mirror Bulge 1 on both torso parts 104 -> 48 left (all hair); shipped 584 -> 528. mirror1.py floors 86% / 98%. Models re-baked. rw4 seams unchanged (hips 0/0, arms 4/0).
- Rig Editor Stretch: Tools row under the preview; dots (`.hdl` in `#toolLayer`) at the selected part's far end (bone matrix + `segOffset` + axis by kind) or the selected lock's tip; drag along the part's screen line sets `<part>.len` or `hair.L<k>.len` (clamped to the stat's range, rounded to its step; a lock never gets too short to build). Drags off a dot still orbit.
- Rig Editor Draw (hair): `drawFit` picks the lock whose root is within 40 px of the stroke start (the selected lock wins a near tie), resamples the stroke to K+1 points, grid-searches len/curl/ang then refines twice; sets `hair.L<k>.*` and selects the lock. ~110 ms headless. Right-drag orbits in Draw (`controls.mouseButtons.RIGHT`). Left-drag captured on `#stage` (capture phase, ahead of OrbitControls).
- `hairLocks` `lock(th,k,sg,o)`: with `o` it returns only the centre line; `HAIRLOCKS[].path(o)` maps it into the Head part's space (mirror included); world = `bones.Head.matrixWorld`.
- Test `tests/fu/rigtool1.py` ALL PASS; hair1, mirror1, bmir1, mobsave1 pass; rx8, rigpages, fu3, fu6 logs clean.

## In progress
- Nothing. Waiting on Ricky: try Stretch and Draw; Mirror Bulge 1 for the torso; publish v199 when happy.

## Decisions
- Draw reshapes an existing lock (its own Length, Extra Curl, Angle) rather than adding new free hair chains: no new saved data. Ricky to confirm that's what he wanted.
- Turning a tool on poses her at Rest; turning it off gives the old pose back. The Mobs page turns the tools off.

## Next steps
1. Ricky: playtest Stretch and Draw; say if Draw should make new chains instead. 2. Mirror Bulge 1 on Upper/Lower Torso, then re-bake. 3. Hair facets (48 left: lock strips at the cap, ponytail top). 4. Publish v199 (bump label).

## Gotchas
- With default lengths only locks 0, 1 and 13 exist (sides/back lengths are 0): tests must pick those.
- Tests load the copy from `tests/mk_test.py`: always run the full build chain before a test, or it tests stale code.
- Draw gives no hint where roots are; with few locks, start on the front locks. Could add root dots if Ricky finds it hard.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
