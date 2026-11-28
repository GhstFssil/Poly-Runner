# Handoff (2026-11-28)

## Goal
Drawn faces from Ricky's reference image, for Molly and Comet: published as v199 (main = next).

## Done
- Drawn face (GLOSSARY: drawn face, face sheet). `faceSheet()` in rig-editor.html paints eyes (eye white with lid shadow, layered iris in `cEye`, pupil, catch light, lash line thickening outward with a wing, short lower outer lash), brows (`cBrow`, thick inner end, tapering, arched, slanted) and mouth (line + soft lower lip) on a 512 px canvas, in cm on a built-in-size head (`FACE_S` -8..8 round the face, `FACE_Y` 2..18 up the head).
- `buildFace()` (called from `rebuild`): 33x33 grid of rays from in front, dropped onto the Head's 'skin' facets, lifted 2 mm, u from distance round the face; only inked cells kept (~390 tris). SkinnedMesh `Runner_face`, MeshBasicMaterial (unlit, blended), weights from `vertW`.
- Stats under Stats > Face (`face.*`, 19 of them) and a Brows colour. `face.on` off brings back the old flat eye/brow/mouth quads. Nose is still geometry, colour key 'nose' (so the sheet skips it), sized by `face.nose`.
- Comet has it too (Ricky, 2026-11-28; her iris uses her own `cEye`). molly.glb and comet.glb re-baked (about +100 KB each: 40 KB PNG + face mesh).
- molly.js loader: the face mesh casts no shadow and isn't taken as `mollyMesh`.
- v199 published: Drawn faces, Stretch and Draw, Comet's ringlets.

## In progress
- Nothing.

## Decisions
- Ricky: adjustable (sliders) rather than fixed to the reference; on for Comet too.
- Mine: unlit face sheet (crisp anime look; in shade the eye whites stay bright against dark skin; switching to lit is a one-word material change); colours other than iris/brows are fixed in `faceSheet`.

## Next steps
1. Ricky tunes the faces. Possible: lit vs unlit, deeper default iris colour, blink/expression swaps. 2. Lock Heading for Comet.

## Gotchas
- A rebuild now takes ~165 ms instead of ~70 (the face raycast); fine for sliders, but a place to speed up if it drags.
- `bake_models.py` rebuilds the game but the test copy comes from before: run `tests/mk_test.py` again before game tests.
- In-game close-ups right after spawn catch the spawn flash; take a throwaway view first.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` behind; don't commit it.
