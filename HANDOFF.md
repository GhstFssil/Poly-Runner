# Handoff (2026-11-25)

## Goal
Everything in BACKLOG's Characters and looks group, on `next`, one item at a time (CHANGELOG entry v196, label still v195 until publish).

## Done
- Character Select (step 1): choosing a level opens `scr-pickchar` (ui/page-body.html); two compact stat cards with Play buttons; the last pick is marked "(last time)", focused, id `pcLast`. Back returns to Level Select. The Characters page shows both full cards, no buttons. Wiring: `pickThen`/`__pickChar` in ui/screens.js; cards in `refreshStatCards` (level1/trees.js).
- Tests: `tests/fu/pick1.py` ALL PASS; comet1 now uses `__setChar`; reg2/reg3/reg4/lvprobe/steep*/oc_new click `pcLast` after a level button.

## In progress
- Step 2: Comet's standing-style hover pose (own Rig Editor page).

## Decisions
- Path Editor test play and Dev sandboxes keep the current character (no prompt); only Level Select asks (my call).
- Faceting (step 3): if nothing is found wrong, keep the backlog item and review with Ricky (Ricky).

## Next steps
1. Comet hover pose. 2. Faceting check. 3. Fine-grained hair control. 4. Comet ringlets. 5. Face pieces (ask Ricky about style first).

## Gotchas
- rx8.py logs "Molly model turned away" on purpose-made odd stats; it does that on the old build too.
- Headless Chrome sends its own mousemoves with Caps Lock off; cam1.py stubs `getModifierState` for that.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
- Any new test that starts a level from Level Select must click `#pcLast` (or a `.pickChar`) after the level button.
