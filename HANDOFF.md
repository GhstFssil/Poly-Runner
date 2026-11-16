# Poly Runner handoff (overwrite each time; keep under 30 lines)

Standing rules: CLAUDE.md. Stable facts, branches and test commands: ARCHITECTURE.md. History: the CHANGELOG in `checker-run.html` and `audit-notes.md`. Open work: BACKLOG.md.

Last updated 2026-11-16, after v181. In progress: nothing.
Unmerged: `nightly/2026-11-16` (hidden-layer stamp shading fix, `tests/pegho.py`). Merge to `main` as v181.1 once Ricky approves.

## Key decisions (Ricky's unless marked)
- Star aim (Claude's call; reported to Ricky): follows the camera's yaw and is level at the camera's resting pitch of 0.35, because a literal camera ray would hit the ground about 6 u ahead.
- Comet's poses are layered over the clips (upper-body override; Hover and Fly legs are additive), not baked into clips. Hover ignores mud, toxic ground, plates and landing damage.
- Mob dials live only in Molly's store. Comet's store never holds `mn.*` (`noMobs`).

## Gotchas and failed approaches
- After changing the shipped settings, run `python3 tools/bake_models.py`, or the built-in models won't match them.
- When rewriting a tag with regex, recompute match positions after each edit. A stale `m.end()` once nested `comet-settings` inside Molly's JSON.
- Headless fps swings from 2 to 26 and dt is capped, so timing-based results vary. Poll state instead of using fixed waits. `fu/steep1.py` is noisy.
- Test minions: use `__ens().filter(q => q.x > 59000 && q.x < 9e6)`. Index 0 is a level-1 minion. Start the blank sandbox (`#dtBlank`) before `__sbStart`.
- `tests/chk.py` flags a comment containing "x = y (" as swallowed code. Reword it.
