# Handoff (2026-11-28)

## Goal
Molly's face from Ricky's reference image (BACKLOG: special assets for the faces): a drawn face she can tune. First try done on `next`, waiting on Ricky's look.

## Done
- Drawn face (GLOSSARY: drawn face, face sheet). `faceSheet()` in rig-editor.html paints eyes (eye white with lid shadow, layered iris in `cEye`, pupil, catch light, lash line thickening outward with a wing, short lower outer lash), brows (`cBrow`, thick inner end, tapering, arched, slanted) and mouth (line + soft lower lip) on a 512 px canvas, in cm on a built-in-size head (`FACE_S` -8..8 round the face, `FACE_Y` 2..18 up the head).
- `buildFace()` (called from `rebuild`): 33x33 grid of rays from in front, dropped onto the Head's 'skin' facets, lifted 2 mm, u from distance round the face; only inked cells kept (~390 tris). SkinnedMesh `Runner_face`, MeshBasicMaterial (unlit, blended), weights from `vertW`.
- Stats under Stats > Face (`face.*`, 19 of them) and a Brows colour. `face.on` off brings back the old flat eye/brow/mouth quads. Nose is still geometry, colour key 'nose' (so the sheet skips it), sized by `face.nose`.
- Comet: `DEFC['face.on']=0`, so comet.glb is byte-identical. molly.glb re-baked (+108 KB: 40 KB PNG + face mesh).
- molly.js loader: the face mesh casts no shadow and isn't taken as `mollyMesh`.
- CHANGELOG line added to the unpublished v199 entry (retitled).

## In progress
- Ricky's visual check (screenshots sent from the Rig Editor and in game).

## Decisions
- Ricky: adjustable (sliders) rather than fixed to the reference.
- Mine: unlit face sheet (crisp anime look; in shade the eye whites stay bright against dark skin; switching to lit is a one-word material change); colours other than iris/brows are fixed in `faceSheet`.

## Next steps
1. Ricky reviews/tunes. Possible: lit vs unlit, deeper default iris colour, blink/expression swaps. 2. Lock Heading for Comet. 3. Publish v199 when he says so.

## Gotchas
- A rebuild now takes ~165 ms instead of ~70 (the face raycast); fine for sliders, but a place to speed up if it drags.
- `bake_models.py` rebuilds the game but the test copy comes from before: run `tests/mk_test.py` again before game tests.
- In-game close-ups right after spawn catch the spawn flash; take a throwaway view first.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` behind; don't commit it.
