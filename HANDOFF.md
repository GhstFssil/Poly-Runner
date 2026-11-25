# Handoff (2026-11-25)

## Goal
Everything in BACKLOG's Characters and looks group, on `next`, one item at a time (CHANGELOG entry v196, label still v195 until publish).

## Done
- Character Select (step 1): choosing a level opens `scr-pickchar` (ui/page-body.html); two compact stat cards with Play buttons; the last pick is marked "(last time)", focused, id `pcLast`. Back returns to Level Select. The Characters page shows both full cards, no buttons. Wiring: `pickThen`/`__pickChar` in ui/screens.js; cards in `refreshStatCards` (level1/trees.js).
- Tests: `tests/fu/pick1.py` ALL PASS; comet1 now uses `__setChar`; reg2/reg3/reg4/lvprobe/steep*/oc_new click `pcLast` after a level button.

- Comet Hover pose (step 2): hovering plays Idle instead of a run clip (molly-update.js); `comet.ho.*` changes still laid over it, plus new stat `comet.hov.lean` (12°, scaled by speed / hover top speed, comet.js). Rig Editor Hover preview uses `poseIdle` with the lean at full. Test `tests/fu/hov1.py` ALL PASS.

## In progress
- Step 3: faceting mirror check.

## Decisions
- Path Editor test play and Dev sandboxes keep the current character (no prompt); only Level Select asks (my call).
- Faceting (step 3): if nothing is found wrong, keep the backlog item and review with Ricky (Ricky).

## Next steps
1. Faceting check. 2. Fine-grained hair control. 3. Comet ringlets. 4. Face pieces (ask Ricky about style first).

## Gotchas
- rx8.py logs "Molly model turned away" on purpose-made odd stats; it does that on the old build too.
- Headless Chrome sends its own mousemoves with Caps Lock off; cam1.py stubs `getModifierState` for that.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
- Any new test that starts a level from Level Select must click `#pcLast` (or a `.pickChar`) after the level button.
