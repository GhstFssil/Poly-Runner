# Handoff (2026-11-24)

## Goal
v195: rename cleanup plus two Comet star fixes, from the BACKLOG regroup of 2026-11-24.

## Done (on `next`, not yet on `main`)
- Removed the v194 one-time save copy (`idbMigrate` in molly.js; localStorage copy in core/start.html and path-editor.html; test `fu/rename_saves.py`). Ricky confirmed his saves; he is the only player.
- Retired `tools/mk_sweep_docs.py` (it also wrote the nightly task prompts; restore from git history if the sweeps return).
- Comet: Star Throw aims 0.175 rad (10°) above the camera, was 0.35 (`starAimDir` in comet.js).
- Comet: big star tips back flat (halo) while flying: stat `comet.fly.starTilt` (default 90, in trees.js defaults; Fly page row and preview in rig-editor.html). The back star's rotation is now order YXZ, so a tilt turns with her heading.
- v195 CHANGELOG entry written; label still v194.

## Next steps
1. Ricky tries it on `next`; on his go-ahead, bump the label to v195 and merge `next` into `main`.
2. Then: camera and controls group (BACKLOG).

## Gotchas
- Nightly sweeps are paused (Anthropic-side scheduling trouble); their last branches (11-15 to 11-17) are merged.
- `tools/mk_electron.py` reads fonts from a hard-coded `/tmp/fx`; the release workflow uses `build_release.py`.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
