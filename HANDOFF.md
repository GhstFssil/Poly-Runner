# Handoff (2026-11-25)

## Goal
The camera and controls group from BACKLOG (now done and removed from it), on `next`, with the unreleased v195 work.

## Done (published as v195 on 2026-11-25: `next` merged into `main`)
- v195 work from 11-24 (save-copy removal, mk_sweep_docs retired, Comet star fixes).
- Camera Zoom: the mouse wheel sets the boom 4 to 20 (default 8.5, saved as `pr_camzoom`); it stretches up to 30% with speed (`CAM_PULL` 0.2, capped at 1.5x top speed). input.js, loop.js.
- Free Look: Caps Lock on, the mouse turns only the camera (no steering, no turning to face it when standing); turned off, `lookBack` swings the camera behind her, then steering resumes. Caps Lock is read via `getModifierState` on every key and mouse event.
- Drag-to-look removed from F4 (Ricky). A saved 'drag' falls back to locked. The in-game Path Editor still sets `mouseMode = 'drag'` internally (the pointer must stay free there), and Sidestep is off in that mode.
- Sidestep: left or right mouse button held walks her sideways relative to her heading at `stat.sidestep` (6 Zips; Rig Editor Stats). Same wall and ledge checks as Strafe (shared `sideMove` in molly-moves.js); ground only, not in the Barrier or a face-plant. Both characters.
- Sidestep animation: new Rig Editor page (stats `step.*`), clips `Step_L`, `Step_R`; shown only instead of Idle, so running forward the run wins (Ricky). Built-in models re-baked (`tools/bake_models.py`). A model saved before this has no Step clips: she idles while stepping until it is saved again in the Rig Editor.
- Q/E is now labelled Strafe (a quick hop) on the controls page; GLOSSARY has Camera Zoom, Free Look, Sidestep.
- Tests: `tests/fu/cam1.py`, `tests/fu/side1.py` (both ALL PASS); reg2, fu1, fu1b, fu3, fu6, rx8 run clean apart from known noise.

## Decisions
- Caps Lock off: the camera swings back (Ricky). Drag mode: removed (Ricky). Sidestep anim: only when not running forward (Ricky).
- Sidestep in the air or while hovering: not allowed (my call; easy to change in `sidestepTick`).

## Next steps
1. Ricky re-saves his Molly and Comet in the Rig Editor to get the Sidestep clips into his saved models; tune the Sidestep page and speed.
2. Next interactive work goes on `next` from v195.

## Gotchas
- rx8.py logs "Molly model turned away" on purpose-made odd stats; it does that on the old build too.
- Headless Chrome sends its own mousemoves with Caps Lock off; cam1.py stubs `getModifierState` for that.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
