# Handoff (2026-11-21)

## Goal
Split the single-file game into `src/` parts by function (areas: core, level1, level2, sandbox, characters, mobs, ui), with GLOSSARY.md as the one list of terms.

## Done
- Old procedural character body removed (47bdb52).
- Step 0: `src/manifest.json` + `tools/build.py`; `checker-run.html` is generated, byte-identical, `chk.py` detects drift.
- GLOSSARY.md written; docs-only push to main (7104d93), merged into `next`.
- On `next`: Enemy -> Mob rename in the game (`MOBS`, `killMob`, `updateMobs`; Path Editor's own list is `MOB_KINDS`); Path Editor labels in Title Case (Big Minion, Toxic Patch, Caution Sign, Seg Chain, Mud, Crags, ...).
- CLAUDE.md `src/` rules, BACKLOG.md and GLOSSARY.md updates on `next`.
- Step 1 (2026-11-21): `src/index.html` cut in place into `src/data/*` (settings, user-def, models, changelog, level1, level2) and `src/unsorted/01..06` (code, in game order). Build byte-identical to before.

## In progress
Nothing half-done. `next` has this batch committed (see HISTORY.md).

## Decisions
- Terms: mob / minion / Big Minion / Roost Gazer; character; stat; tile; Barrier; Mud; Crags; every word of a label capitalized.
- Frozen storage names stay (see GLOSSARY.md).
- Cut in place first (byte-identical), reorder later.

## Open (Ricky decides)
- Decided 2026-11-21, not yet done: use Rotation (`rot`; keep reading `heading` in old saves); sweep dials/squares/"Hedron Barrier"/sentence-case labels to the glossary terms; labels are Title Case.

## Next steps
1. Step 2: carve `src/unsorted/` into areas (one area per task, cut in place, byte-identical check), starting with a leaf (mobs or ui).
2. Add `tools/check_deps.py` (warning only; plain split, no IIFEs for now: Ricky's call 2026-11-21).
3. At release: v185 bump + CHANGELOG entry (Mob wording, Path Editor labels); `tools/mk_sweep_docs.py` is behind the SWEEP docs, never regenerate it blindly.

## Gotchas
- Shallow clone: `git -c push.negotiate=true push`.
- `tests/fu/door4.py` fails and `minionhit.py` is ~50% flaky on both old and new builds (in BACKLOG).
- Comparison tests need old builds (aud_head.html, aud_pre.html).
