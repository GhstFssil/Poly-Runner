# Handoff (2026-11-27)

## Goal
Make paths that curve into walls easier to follow without changing physics (the old BACKLOG Decision): Lock Heading + Dash Line, on `next` inside v197 (Editor tools are already in that entry).

## Done
- Dash Line (ui/dash-line.js, called from loop.js with `dashNow`): an InstancedMesh of 50 flat red dots, every 4 units out to 200 along her heading, each at `groundH` + 0.08; the last 8 shrink. Molly only. Test `tests/dl1.py` ALL PASS.
- Caps Lock (core/input.js): `readCaps` (read the lock light on every key and mouse event) replaced by one keydown listener: each press flips `freeLook` while playing; turning off sets `lookBack`; turning on calls `lockHeadingTry`.
- Lock Heading (characters/lock-heading.js): `lockHeadingPath` finds the stretch under her (pathH stretches, not walls `wl`, not circular decks, within width, height within 3 units, nearest in height), heading `atan2(-vx,-vz)`; nearer of the two ways; `LH_COOL` 1000 ms (only on a fire); over 30° above 20 Zips -> drops the Barrier quietly, Faceplant, heading kept. Needs `grounded`, not `wallOn`, not `fpOn`, Molly only. Test `tests/lh1.py` ALL PASS; `fu/cam1.py` updated for presses, ALL PASS.
- Docs: GLOSSARY (Free Look, Lock Heading, Faceplant, Dash Line), Controls screen text, CHANGELOG v197 entry, BACKLOG item removed, SWEEP-BUGS test map. CLAUDE.md: nightly sweeps paused (Ricky).

## In progress
- Nothing. Ricky to playtest.

## Decisions
- Caps Lock press toggles Free Look; Lock Heading only on the press that turns it on (Ricky). Any angle; over 30° above 20 Zips trips (Ricky). Not on wall paths (Ricky). Dash Line only for the Dodecadash (Ricky).
- My calls: in the Barrier a trip drops it and she faceplants; Comet has no Lock Heading or Dash Line (she has no Faceplant clip or Dodecadash); Free Look presses are ignored outside play; the cooldown starts only when it actually fires (or trips).

## Next steps
1. Ricky playtests Lock Heading on curved wall approaches and the Dash Line. 2. Rest of Editor tools (Rig Editor Stretch, then Draw for hair).

## Gotchas
- Free Look no longer follows the Caps Lock light: they can disagree (harmless). macOS Chrome may send CapsLock keydown only when the lock turns on (keyup when off); untested there.
- Standing still with Free Look off, her heading follows the camera: tests set `yaw` with `heading`, or set heading inside Free Look.
- Headless runs are slow: test the 1 s cooldown with key events dispatched inside one evaluate (lh1.py does).
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
- Any new test that starts a level from Level Select must click `#pcLast` after the level button.
