# Handoff (2026-11-25)

## Goal
Everything in BACKLOG's Characters and looks group, on `next`, one item at a time (published as v196 on 2026-11-25).

## Done
- Character Select (step 1): choosing a level opens `scr-pickchar` (ui/page-body.html); two compact stat cards with Play buttons; the last pick is marked "(last time)", focused, id `pcLast`. Back returns to Level Select. The Characters page shows both full cards, no buttons. Wiring: `pickThen`/`__pickChar` in ui/screens.js; cards in `refreshStatCards` (level1/trees.js).
- Tests: `tests/fu/pick1.py` ALL PASS; comet1 now uses `__setChar`; reg2/reg3/reg4/lvprobe/steep*/oc_new click `pcLast` after a level button.

- Comet Hover pose (step 2): hovering plays Idle instead of a run clip (molly-update.js); `comet.ho.*` changes still laid over it, plus new stat `comet.hov.lean` (12°, scaled by speed / hover top speed, comet.js). Rig Editor Hover preview uses `poseIdle` with the lean at full. Test `tests/fu/hov1.py` ALL PASS.

- Faceting (step 3, partly): ring quads tagged in `buildSeg` and re-cut in model space by `quadSplit`/`diagPick` (soupOf); hair quads use `diagPick`; Shading Variation is `shadeAt` (smooth noise of |x|,y,z, seeded per part id without side). Facets mirrored 492 -> 2696 of 3558; limbs and shades exact. Built-in models re-baked. Test `tests/fu/mirror1.py`. rw4 welds: default/sides7 unchanged (0 odd); irr 0.6: arms 4 open/2 odd (was 3 open, broken loops).

- Split (2026-11-25): character setup moved from level1/trees.js to characters/character-stats.js (loads right after it; game unchanged).
- Hair locks (step 4): bangs replaced by a ring of `hair.count` locks (rig-editor.html `hairLocks`, after `headFeatures`); shared `hair.*` stats on the Head page; click a lock -> `ui.lock`, rows for `hair.L<k>.len/curl/ang` (k = pair from the front; partners share, right one built as the left's mirror when Part Position is 0). Defaults: 14 locks, only the front 3 long enough to build (front length 1, sides/back 0; pair 1 length 1.3 to keep the old side bangs' length). Old `bangL` -> `hair.lenF` in `upgrade()`; shipped settings renamed. Models re-baked. Test `tests/fu/hair1.py` ALL PASS.

## In progress
- Faceting review with Ricky: welded shoulders/hips and centre-line strips still not mirrored (BACKLOG entry kept). Cutting centre-line quads at x=0 was tried and reverted: it made 7 odd edges at the crotch weld.

## Decisions
- Path Editor test play and Dev sandboxes keep the current character (no prompt); only Level Select asks (my call).
- Faceting (step 3): if nothing is found wrong, keep the backlog item and review with Ricky (Ricky).
- Hair: Spread = lean out from the head (not how far round the front length reaches); length blends front 0-30°, to sides by 60°, sides to 120°, to back by 150°; locks under 0.25x are left out (my calls).

## Next steps
1. Ricky reviews the hair locks (look and stat ranges). 2. Faceting review (Ricky). 3. Comet ringlets (build on the locks: curl + tightness). 4. Face pieces (ask Ricky about style first).

## Gotchas
- A front-middle lock's underside strip straddles the centre line and is not mirrored (same as the BACKLOG faceting item); hair1.py allows for it.
- rx8.py logs "Molly model turned away" on purpose-made odd stats; it does that on the old build too.
- Headless Chrome sends its own mousemoves with Caps Lock off; cam1.py stubs `getModifierState` for that.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
- Any new test that starts a level from Level Select must click `#pcLast` (or a `.pickChar`) after the level button.
