# Handoff (2026-11-25)

## Goal
Everything in BACKLOG's Characters and looks group, on `next`, one item at a time (CHANGELOG entry v196, label still v195 until publish).

## Done
- Character Select (step 1): choosing a level opens `scr-pickchar` (ui/page-body.html); two compact stat cards with Play buttons; the last pick is marked "(last time)", focused, id `pcLast`. Back returns to Level Select. The Characters page shows both full cards, no buttons. Wiring: `pickThen`/`__pickChar` in ui/screens.js; cards in `refreshStatCards` (level1/trees.js).
- Tests: `tests/fu/pick1.py` ALL PASS; comet1 now uses `__setChar`; reg2/reg3/reg4/lvprobe/steep*/oc_new click `pcLast` after a level button.

- Comet Hover pose (step 2): hovering plays Idle instead of a run clip (molly-update.js); `comet.ho.*` changes still laid over it, plus new stat `comet.hov.lean` (12°, scaled by speed / hover top speed, comet.js). Rig Editor Hover preview uses `poseIdle` with the lean at full. Test `tests/fu/hov1.py` ALL PASS.

- Faceting (step 3, partly): ring quads tagged in `buildSeg` and re-cut in model space by `quadSplit`/`diagPick` (soupOf); hair quads use `diagPick`; Shading Variation is `shadeAt` (smooth noise of |x|,y,z, seeded per part id without side). Facets mirrored 492 -> 2696 of 3558; limbs and shades exact. Built-in models re-baked. Test `tests/fu/mirror1.py`. rw4 welds: default/sides7 unchanged (0 odd); irr 0.6: arms 4 open/2 odd (was 3 open, broken loops).

## In progress
- Faceting review with Ricky: welded shoulders/hips and centre-line strips still not mirrored (BACKLOG entry kept). Cutting centre-line quads at x=0 was tried and reverted: it made 7 odd edges at the crotch weld.

## Decisions
- Path Editor test play and Dev sandboxes keep the current character (no prompt); only Level Select asks (my call).
- Faceting (step 3): if nothing is found wrong, keep the backlog item and review with Ricky (Ricky).

## Next steps
- Step 4 plan (Ricky approved 2026-11-25; start in a fresh session). Hair = cap + one ring of locks on the hairline, all built alike; NO separate bangs (Ricky): the 3 bang spikes become the front locks. Shared stats: lock count, thickness, taper, curl amount, curl tightness, spread, part position, length at front/sides/back (blended). Per-lock overrides (click a lock: length, curl, angle), L/R partners edited together (keep faceting mirrored: use `diagPick`). Ponytail keeps its own bones; locks skinned to Head. Migration: old `bangL` sets front length; defaults match today's look (check GLOSSARY for frozen names). Code: hair builder in rig-editor.html (~line 204, `hairVol`, `bangL`), stats in rig-editor-start.html (`GLOBAL`, line ~122).
1. Faceting review (Ricky). 2. Fine-grained hair control. 3. Comet ringlets. 4. Face pieces (ask Ricky about style first).

## Gotchas
- rx8.py logs "Molly model turned away" on purpose-made odd stats; it does that on the old build too.
- Headless Chrome sends its own mousemoves with Caps Lock off; cam1.py stubs `getModifierState` for that.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
- Any new test that starts a level from Level Select must click `#pcLast` (or a `.pickChar`) after the level button.
