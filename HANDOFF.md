# Handoff (2026-11-27)

## Goal
Comet's own hair (ringlets) and her own Faceplant (BACKLOG, Characters and looks): done on `next`, waiting on Ricky's look. Next item after that: the face assets (Ricky's reference image: angled brows, almond eyes with heavy upper lashes and a two-tone iris with a highlight, a small triangle nose, a thin smile).

## Done
- Ringlets: Head stats Ringlet Turns `hair.ring` (0 = none) and Ringlet Width `hair.ringW` (times the lock's width). In `hairLocks`, with turns > 0 a lock gets 8 stretches a turn, hangs straight down once past the head's widest line, and its strand winds round the centre line as a three-sided tube (0.6x the width). A centre-line lock (front or back) waves to and fro in the centre plane instead, so it stays its own mirror image (mirror1.py needs that). Turns 0: byte-identical to before (Molly's glb is unchanged).
- Ponytail switch `ponyOn` (default 1) under Ponytail Pose: off skips the Pony parts in `rebuild` (bones stay, clips unchanged).
- Comet shipped: ponyOn 0, 16 locks, lengths F 0.4 / S 1.8 / B 2.3, turns 2, width 0.4, thickness 1.2, taper 0.4, spread 6.
- Comet's Faceplant (her `m.fall.*` keys): belly-flop dive, arms straight ahead, lands prone with her back arched, knees bend so her feet kick up while she skids (key 6 held).
- comet.glb re-baked. Test `tests/fu/ringlet1.py`. CHANGELOG lines added to the unpublished v199 entry (retitled).

## In progress
- Ricky's visual check (screenshots sent). Every number is a stat he can tune in the Rig Editor (Comet page, Head; Faceplant keys).

## Decisions
- Ricky: Comet's ringlets replace her ponytail; her Faceplant is a belly-flop with her arms forward.
- Mine: ringlets always hang below the widest line (only when turns > 0, so Molly is untouched); centre-line locks wave instead of winding.

## Next steps
1. Ricky reviews the ringlets and the Faceplant. 2. Face assets from his reference. 3. Lock Heading for Comet (unblocked). 4. Publish v199 when he says so.

## Gotchas
- Comet can't trip in the game yet (no Barrier, no Lock Heading), so her Faceplant is only visible in the Rig Editor until Lock Heading lands.
- More helix turns means more faces (8 stretches a turn, 6 faces a stretch, per lock).
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` behind; don't commit it.
