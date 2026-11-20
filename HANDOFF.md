# Handoff
Last updated 2026-11-20. Overwrite each time; keep under 40 lines. Change record: HISTORY.md (don't read unless asked).

## Goal
Poly Run (Polyrunner): a single-file three.js r128 platformer starring Molly, with an embedded Path Editor and Rig Editor. Standing rules: CLAUDE.md. Stable facts, branches and test commands: ARCHITECTURE.md.

## Done
- 2026-11-20: `next` was fast-forwarded into `main` (Ricky approved): groups 2-3 (Roost Gazer, invulnerable mode, drift grip, minion hits, barrier lean, half heart, editor/UI polish) on top of group 1. The label stayed v184, so the v184 release was overwritten with this work.
- 2026-11-20: docs aligned with the other Ricky repos (common CLAUDE.md sections, HISTORY.md started, `audit-notes.md` frozen, sweeps log to HISTORY.md).

## In progress
- Nothing. Pending Ricky's go-ahead: bump the label to v185 with its CHANGELOG entry. Unmerged nightly branches: none (as of 2026-11-17).

## Decisions (Ricky's unless marked)
- Star aim (Claude's call; reported to Ricky): follows the camera's yaw and is level at the camera's resting pitch of 0.35, because a literal camera ray would hit the ground about 6 u ahead.
- Comet's poses are layered over the clips (upper-body override; Hover and Fly legs are additive), not baked into clips. Hover ignores mud, toxic ground, plates and landing damage.
- Mob dials live only in Molly's store. Comet's store never holds `mn.*` (`noMobs`).

## Next steps
1. Bump the label to v185 (ask Ricky first this time: the push on 2026-11-20 had no bump).
2. Session start: check the nightly branches and report (CLAUDE.md, Project).
3. See BACKLOG.md.

## Gotchas
- A push to `main` with an unchanged label overwrites that release (happened to v184 on 2026-11-20).
- Timing-based tests: a 4 s wait is not always enough for her to finish a slide or a run headless (steep2 gave different answers run to run); rerun with a longer wait or poll before calling something a regression. Runs with `draw=True` are far slower.
- After changing the shipped settings, run `python3 tools/bake_models.py`, or the built-in models won't match them.
- When rewriting a tag with regex, recompute match positions after each edit. A stale `m.end()` once nested `comet-settings` inside Molly's JSON.
- Headless fps swings from 2 to 26 and dt is capped, so timing-based results vary. Poll state instead of using fixed waits. `fu/steep1.py` is noisy.
- Test minions: use `__ens().filter(q => q.x > 59000 && q.x < 9e6)`. Index 0 is a level-1 minion. Start the blank sandbox (`#dtBlank`) before `__sbStart`.
- `tests/chk.py` flags a comment containing "x = y (" as swallowed code. Reword it.
