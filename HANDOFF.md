# Handoff (2026-11-27)

## Goal
Mirrored faceting (BACKLOG, Characters and looks), on `next` as v198 (CHANGELOG entry started; label still v197).

## Done
- v197 published (Editor tools, Lock Heading, Dash Line, Mirror toggle not in it).
- Mirror Bulge 1 (`<part>.umir`, default 0): toggle row in Bulge 2's panel replaces its rows; `bulgeMirSync` (in save and rebuild) copies u1 to u2 with a negated, wl/wr and kl/kr swapped. Test `tests/fu/bmir1.py`.
- Centre-line quads: `quadSplit(L,k,extra)` fans a quad that crosses x=0 into four round its middle (middle snapped to x=0 within 2 mm, else the welds' centre cut left a sliver: 1 odd hip edge).
- Mirrored welds: `weldMirror` (rig-editor.html, before chainLoops): when both the body soup and the two limb soups are mirrors (keys rounded to 0.1 mm), only the left weld is cut/tidied/bridged; the body = left half + its mirror + untouched straddlers; right limb, bridge and cut loop mirrored; mirrored points snap to existing right-side points. Shipped torso bulges are not mirror pairs, so it falls back today.
- Numbers (Molly, jit 0.2): unmirrored 860 -> 584 shipped; 104 with Mirror Bulge 1 on both torso parts (Head 68 hair, Spine 24, Pony1 12). rw4 seams: hips 0/0, arms 4/0 (as before). mirror1.py floors raised (84%, and 96% with the toggles). Models re-baked.

## In progress
- Ricky's visual check (screenshots sent) and his call on turning Mirror Bulge 1 on for the torso.

## Decisions
- Caps Lock press toggles Free Look; Lock Heading only on the press that turns it on (Ricky). Any angle; over 30° above 20 Zips trips (Ricky). Not on wall paths (Ricky). Dash Line only for the Dodecadash (Ricky).
- My calls: in the Barrier a trip drops it and she faceplants; Comet has no Lock Heading or Dash Line (she has no Faceplant clip or Dodecadash); Free Look presses are ignored outside play; the cooldown starts only when it actually fires (or trips).

## Next steps
1. Ricky: Mirror Bulge 1 for Upper/Lower Torso (changes the shipped shape slightly), then re-bake. 2. Hair locks' straddling strips; the 24 spine facets. 3. Ricky playtests Lock Heading and the Dash Line.

## Gotchas
- Free Look no longer follows the Caps Lock light: they can disagree (harmless). macOS Chrome may send CapsLock keydown only when the lock turns on (keyup when off); untested there.
- Standing still with Free Look off, her heading follows the camera: tests set `yaw` with `heading`, or set heading inside Free Look.
- weldMirror's symmetry test is exact to 0.1 mm: any asymmetric stat on a torso part (bulges) turns it off silently; `window.__wm`-style logging was used to find why.
- Headless runs are slow: test the 1 s cooldown with key events dispatched inside one evaluate (lh1.py does).
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
- Any new test that starts a level from Level Select must click `#pcLast` after the level button.
