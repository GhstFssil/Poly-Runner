# Poly Run audit notes (started after v173, Nov 12 2026)

Baseline: v173 as sent (backups /tmp/cr-v173.html, /tmp/pe-v173.html).
Test tools: /tmp/aud (audc.py harness, mk_test.py makes a hooked test copy, scan.py / along.py compare footing vs what is drawn vs the path's own height).

## Fixes made (not yet in a zip)
1. Path Editor: seg chain defaults were declared twice (the second wiped Height/Rise/Arc defaults). Merged.
2. Path Editor: typing a huge number (e.g. End Z 1000000 on a curve) crashed the tab. Typed segment numbers are held to each field's range; an End X/Z needing a segment over 20000 long is refused.
3. Path Editor: typing text in a number field left a dead undo step. Now restores the field and drops the step.
4. Game: stats typed to game-breaking values (negative jump, zero grip, top speed below 1...) are held to working values.
5. Stat card: same limits, shows a dash instead of NaN/Infinity.
6. Game (v172 regression): a comment had swallowed two assignments in level3H (l3Ps / l3Pu), so wood-plank and metal-plate path textures on ground-level path lost their pattern. Restored.
7. Removed the dead 'stat.side' and 'stat.vec' stats (Ricky OK'd); vector sum is always on. Removed the unreachable old Stats page in the Rig Editor.
8. NEW: Rig Editor > Stats > Movement details: live tables (flat, slopes down/up, across a slope, turning, walls) + "Try a situation" calculator with a vector diagram.

## Oceana paths rewritten as "decks" (Ricky's report: supersede + curve/bank/slab = choppy, drops through)
Causes found with scans on his oc4.json (pieces 1-17 changed to ov / roll / fl):
- Thin slab strip was drawn flat even when the path is banked; footing was banked (up to 3 units apart).
- Thin slab drawn only between two "low ground" samples, footing used either: holes you ran across on air.
- Supersede on jagged rock: each ground vertex decided alone (raise / leave), slab flag decided per sample: patchwork pits.
- Slab thickness: sbSlabCut also cut the path's own ground beyond a floating piece's ends: pits 6-7 deep at both ends, and she dropped through the drawn thin slab there.
- Footing had an invisible skirt (14 units) outside superseding paths over low ground that the mesh did not have.
9. DONE (code): on Oceana the path is no longer ground. level3H = terrain only (plus the supersede cut); sbDeckTop(x,z,py) = the deck (banked, per-segment width, square ends at the path's ends, gaps cut it, ramps are wedges on it, solid within thickness dk||DECK_TH=2). groundH = max(ground, deck); l3Top(x,z) = max of both for placing things. Supersede only cuts higher rock down to just under the deck (DECK_CUT 0.3), full cut to edge+4.5 then eases over 14. sbSlabOff removed. Backup before: /tmp/cr-pre-deck.html.
   Static scans after (plain / ov / ovbank / ovslab / ovbankslab / bank / slab, 3 ranges): 0 fall-throughs, 0 holes, 0 below-ground. Leftover: 3-13 samples per range 14 units OUTSIDE the path edge beside cut rock (outInvis / outFall) on superseding variants only.
   STILL TO VERIFY: in motion (run.py), screenshots (shot.py), ramps/gaps/ends/pits/enemies on decks, regression (t/reg.py), wall tests (tear/wg.py).

## Findings not fixed (questions for Ricky, ask at the end)
Moved to BACKLOG.md ("Needs a decision from Ricky") on Nov 16 2026.

## Rig Editor edge cases (Nov 13 evening) - FIXES WRITTEN, SYNTAX CLEAN, NOT YET TESTED
Backup before these edits: /tmp/cr-pre-rigfix.html. Test harness: /tmp/aud/righ.py (Rig class), rx1-rx7.py. Test copy needs `python3 /tmp/aud/mk_test.py` after any edit.
Confirmed by test BEFORE the fixes:
- Reset this part / Reset this animation / Reset all went back to an older build (DEF), not the shipped Molly (embedded molly-settings): 116 settings differ (slide 2 s vs 0.85, run cycles, thighs, lower torso...).
- Typed 0 (or negative curve) in length / diameter / depth / peak made NaN points; Save to game then left Molly invisible in the game and it stuck across reloads (stored model).
- Save to game said "Saved" when the model was too big for localStorage (about 5M chars shared with Path Editor saves; default build 1.15M, sides 20 / rings 4 = 3.1M, sides 40 / rings 8 fails): old model silently comes back next launch.
- Reset all / Apply pasted settings left the Stats sliders, animation dials and Barrier preview showing old values.
- "Slide held until" / "Settle held until" could cross the key before or after it (stale slider range, typed values): pose pops.
- The game never read the edited hold time ('mollySettings' was never written): always held at the built-in 72% / 89%.
- Clicking the stage in Hedron Barrier mode selected hidden body parts. Hearts typed 500 drew 500 hearts.
Fixes written (10-20):
10. DEF now = shipped settings, so every Reset returns to shipped Molly.
11. hold(key,v): typed / pasted / saved dials held to working values (HOLDS table; sides <= 48, rings <= 8, hearts <= 12, durations >= 0.05 s...). takeSettings() + orderTimes() on load and on Apply.
12. holdT(): key times stay between their neighbours, live, for sliders and typed values.
13. Save to game: game validates the model (size, NaN points, run cycle) before taking it; stores only after it loads; status says ok / too big to keep / could not load. Rig tick + export guarded if a build throws.
14. Hold times travel inside the saved model (rigRoot.userData slideHold / fallHold -> mollyHoldF). Older saved models and the built-in one use the built-in settings as before.
15. syncAll refreshes Stats, animation dials, Barrier preview. Reset this animation: refreshes Barrier preview, resets slope.side with Drift, refreshes stat card.
16. Stat card follows the drift dials. Editing a selected stage's time while paused moves the preview with it.
17. Barrier mode: clicks do not pick parts; Pause stops the roll; cycle slider disabled.
18. Game: barrier.radius >= 0.2, m.drift.rate >= 0.1, hearts <= 12, colours must be #rrggbb.
Checked and fine: Save to game in Barrier / Rest / wireframe modes; keys typed with focus outside the editor do not change the menu behind it.
STILL TO DO for the Rig Editor: rerun rx1, rx2, rx4, rx5 against the fixes; confirm shipped values pass hold() unchanged (P == DEF on a clean browser); screenshot joints with Irregularity > 0 (open tube ends at blended joints may show cracks); narrow-width layout.
Questions to add: "Overall scale" does nothing in the game (she is always normalised to 3.6 units); the saved model shares the 5 MB browser store with Path Editor saves (move it to a bigger store?); Path Editor autosave fails silently when that store is full.

## Status at the Nov 13 20:22 stop
Rig Editor fixes 10-18: TESTED, all pass (/tmp/aud/rx8.py). Syntax clean.
Seam check (tools: /tmp/aud/rv.py V class, rv2/rv4/rv6/rv7.py; "see-inside" = back faces drawn green, counted by reading the canvas; camera kept 2.4 m out with a narrow lens so it is never inside the body):
19. FIXED + checked: her hair was a one-sided shell, so from the front the far side of it was missing (see-through wedges beside the jaw, slivers round the bangs). Hair shell now has both faces (Part.add2).
20. FIXED + checked: open part ends at blended joints let you see into the torso round the neck (the neck sits 7 cm down in the torso) and into the head under the chin. Every part end is now capped.
After 19+20, default build: no openings in rest / idle / runs / jump / slide / faceplant / Runner's pose / drift (hairlines only, under 400 px of ~365k). Blends 0, sides 5-20 and rings 1-4: also clean.
NOT YET LOOKED AT (counts say something is there):
- Joint blends at slider max: 1,000-5,500 see-inside px at neck, shoulders, elbows, waist, hips, ponytail.
- Irregularity 1: up to 1,600 px; Contour shift 1.5: up to 1,200; both together: 1,500-15,000 (cracks at joints).
- Still to try: a bulge near a joint, thin / wide neck, shoulder overlap and arm spread extremes, narrow-window layout.
Noted, for the question list: rings bunch up into strips 1.5-3 mm wide (upper torso has 25 rings; shoulder, bulge, blend and band rings land next to each other), which show as thin scratch-like stripes on chest, shoulders, arms. Merging rings closer than about 0.5-0.8 cm would remove them but changes her mesh: ask, with a before / after picture. Knee pads stick out as spikes on a deep knee bend (by design?). The built-in Molly (embedded model) does not have fixes 19-20 until she is re-baked: ask.
Regression NOT rerun since the deck rewrite and the Rig Editor changes. No zip built. Version label still v173.

## The jagged hip + shoulders: WELDED (Ricky OK'd hips and shoulders, "I want the faceting to transition smoothly", "willing to wait to get it right")
Backups: /tmp/cr-pre-weld.html (before any weld code), /tmp/cr-pre-ringmerge.html, /tmp/cr-pre-winding.html. "Before" test copy with welding off: scratchpad t/aud_old.html.
Cause was: thigh top pokes through the pelvis at a shallow angle, both 8-sided: ring corners poke through, flats dip under = crown of spikes. Not the blend.
What is in checker-run.html now (Rig Editor code, before function rebuild):
21. wKey / soupField (signed distance to a triangle soup) / clipSoup (cut a soup back to where field >= threshold; per-side halves split on x = 0; shared centre-line measure) / chainLoops (oriented cut edges, kept surface on the left) / tidyLoop (collapse cut-edge points closer than 7 mm, never centre-plane points) / bridgeLoops (walk both edges, shorter diagonal, second edge backwards).
    rebuild(): every part -> world triangle soup (soupOf); WELDJ = {LowerTorso>Thigh: whole loop, UpperTorso>UpperArm: gated near the pivot}; margin = max(0.25 cm, blend/2) each side; parent clipped by the child's surface, child by the parent's, gap bridged with the child's base colour; any failure (not exactly one closed loop each) -> that joint falls back to the old displace method. Weights: vertW(): across a weld the skin goes from body bones to limb bones, half and half where the surfaces meet, R = max(3 cm, 1.5 x blend) each way; parent kidW pulls, child weld.w.
    Result at shipped settings: pelvis + thighs is one closed, consistently faced skin (0 open edges); torso + arms closed except the chest decal. No see-through in any pose (rv4 matrix, all under ~750 px hairlines). Welds hold for blends 0-12, sides 5-20, hipX 4-16, pelvisDrop 0-30, shoulderX 8-40, arm spread 0-40, thigh / arm diameters. Falls back (old joint) only at heavy Contour shift (cut comes out as several loops).
22. Ring merge (RINGGAP 0.8 cm, tList rewritten with priorities): rings within 0.8 cm of a more important one are left out (upper torso 25 -> 17 rings). Removes the scratch-like stripes. NOT yet OK'd by Ricky: show before / after, one constant to revert (/tmp/cr-pre-ringmerge.html has the old tList).
23. Winding: buildSeg now faces a part's skin triangles by one vote for the whole part + topological caps (per-triangle centre test flipped triangles under Irregularity / Contour shift = holes). All ring parts consistent now.
24. Upper-arm band: on domed parts the band was always drawn two rings nearer the start than its dials say (dome rings not counted): dials 19 / 6.5 cm, drawn 11.5 - 22.5 cm. Kept exactly where it was (bandRange + tListOld). QUESTION for Ricky: make the dials tell the truth (convert his numbers so nothing moves)?
Later weld refinements (all in): cut edges are tidied (points closer than 1 cm merged; shared centre-line points merged by one rule for both sides, 1.5 cm); a weld never cuts into a trim band or past it (belt edge stays straight at any blend); hand-over width per joint (WELDJ soft: hips 3 x blend, shoulders 1.5 x blend) with the pull fading out over the 4 cm before the belt; the whole of both cut edges is bridged for arms too (the hidden stretch is the armpit when the arm lifts).
Verified after all of that: watertight at shipped and at blends 0-12, sides 5-20, hipX 4-16, pelvisDrop 0-30, shoulderX 8-40; see-inside matrix clean in rest / runs / jump / slide / faceplant / Runner's pose / drift; rx8.py (Rig Editor edge tests) all pass; Save to game works and she runs and jumps in Level 1 with the welded model (rg1.py, /tmp/aud/shots/ingame_ba.png).
Picture for Ricky: /home/claude/molly-joints-before-after.png (made BEFORE the last weight change: remake with rba2.py before sending).
Known leftovers: ponytail blend at its max (6) opens a slit at the hair tie; Contour shift at max makes the arm weld fall back to the old joint and shows a few holes; neither is a default or common value.
Tools: /tmp/aud/weld/weld.js + t3-t5.js (Node checks of the weld on exported soups), rh2.py (hip sheets), rm1.py (pose sheets), rba.py (before / after sheets), rw1 / rw4 / rw6.py (watertight + loop logs). Run `python3 /tmp/aud/mk_test.py` after every edit; Node copy of the weld code is regenerated by the snippet in the transcript (copies from "function wKey" to "/* which side joints are welded").
Before / after pictures made so far: /tmp/aud/shots/hip_b.png (old hip), hip_w2.png, hip_m0.png (old, in motion) vs hip_m2.png (welded, in motion), ba_rest.png, ba_rest2.png.

## AUDIT FINISHED (Nov 13, about 11:30 PM). No zip built: wait for Ricky. Version label still v173; next is v174 (write the CHANGELOG entry then).
Last additions: Rig Editor button rows wrap on a narrow window (.seg flex-wrap); Path Editor autosave says so when the browser's storage is full (path-editor.html save(), re-embedded with mk_pe_embed.py; embed is in sync).
Final checks, all on the final code: chk.py clean; rx8.py all pass; watertight at shipped / blends 0 and 12 / sides 20 rings 4; reg2.py (Rig Editor, blank sandbox, Level 1, Level 2 start and run, no errors); wall runs match (90 deg 0.58 s / 93 u, Barrier dash 0.62 s / 143 u, 81 deg 0.68 s, rising 0.30 s, falling 1.02 s); Oceana decks: run.py on ovbs / ovp / ovsl / ovbk through 3660-4085 and 4087-4295, centre and +-7: feet 0.00 off the path, no air frames; deck screenshots fine (/tmp/aud/shots/decks_sheet.png); peobj.py: 25 stamps, 0 bad, round trip equal; idle mobs export / import / stand still and turn.
Level 2 from the menu (L2_BARE): she spawns at y -300 and does not move with W held, identical in v173. Asked Ricky whether that is expected.
Picture sent to Ricky: /home/claude/molly-joints-before-after.png.
Questions sent to Ricky in the final report (see transcript): re-bake built-in Molly; arm band dials; ring merge OK; knee pad spikes; Overall scale; model storage; grip units; grip fade on slopes; gravity stat; round vs square gap ends; ledges / hills / pits on Oceana decks; Level 2 menu state.

## FOLLOW-UPS from Ricky's answers (Nov 13, 11:38 PM). Backup before them: /tmp/cr-pre-followups.html, /tmp/pe-pre-followups.html. Reminder set for 3:00 AM to finish.
State of each (update as they are done):
- [x] 7 (DONE, tested fu1.py/fu1b.py) grip in Zips/s2 (new key stat.gripZ, old stat.grip / 2 on load, game and editor) + any other speed shown in units/s -> Zips
- [x] 8 (DONE, tested; keys stat.fadeWall=1 / stat.fadeSlope=0, 'tog' rows in addRows) toggles: grip fades on walls (default on), grip fades on slopes (default off = today's behaviour); Movement details follow them
- [x] 9 (DONE, tested) gravity stat (stat.grav, Zips/s2, default 20); card + Movement details use it
- [x] 3 (DONE: key ringGap in GLOBAL/Faceting, 0 = every ring as before; welds clean at 0..3, rw4.py) Faceting dial "Thinnest strip" (ringGap, cm, default 0.8)
- [x] 2 (DONE: fmt 2, bandLegacy/bandFix/bandOld/defOld; default 19/6.5 -> 11.48/11.0133, model identical; fu2.py fu4.py) arm band dials truthful: settings format marker (fmt 2), convert old UpperArm.bandA / bandL to where the band was really drawn, on load and on paste; shipped settings converted in the re-bake
- [x] 4 (DONE: pad vertices carry kp = thigh share 1/.5/0, set in vertW; rest pose identical, 72 verts reweighted; shots/knee_cmp.png) knee pads: bend with the knee (top half follows the thigh, bottom half the shin)
- [x] 5 (DONE: GLB userData.scale -> mollyScale; model 3.6 x scale, PLAYER_H/RADIUS/SLIDE_H x scale; cards show the real box; fu3.py) Overall scale works in game: model height 3.6 x scale, collision box x scale (tell Ricky; Barrier and camera unchanged)
- [x] 6 (DONE: IndexedDB 'polyrun'/'kv'/'mollyGlb' raw bytes; LS copy moved then removed; LS fallback if no IDB; 48x8 build (5.8 MB) now kept; fu6.py; test hook stored = mollySavedBytes) saved model in IndexedDB (migrate the localStorage one, then remove it); tests' "stored" hook must change
- [x] 1 (DONE Nov 14: captured from the editor's Save to game, 10,422 verts, fmt 2, band 11.48/11.0133, only those two dials differ from the old shipped settings) re-bake built-in Molly (molly-glb + molly-settings) LAST, after 2-5
- [x] (DONE Nov 14: chk.py clean, rx8.py all fine, reg2.py runs (level 2 from the menu does not start in the harness, as noted before), peobj/pefuzz/pesave 0 bad, physics constants identical to v173 at defaults; the timed wall-run script was not kept and the live timing is too noisy to compare, so those five times were NOT re-measured; v174 label + CHANGELOG in) checks: chk.py, rx8.py (adapt), reg2.py, wall runs, movement sanity; v174 label + CHANGELOG; report. No zip unless asked.
- [x] 10 (DONE Nov 14: Ends = round|square on gap, ledge, mud; platform stays square (no setting); editor draws the true footprint; game sbIn(); ends1.py 35,716 points 0 mismatches, ends3.py pixels, ends4.py inspector) 10 (his answer, Nov 13 11:48 PM): "I'd actually like the editor to always show the truth but for me to have the option to set rounded or squared ends." Plan: per-piece "Ends" selector (rounded / squared) on gap, ledge, platform, mud; defaults = what the game builds today (gap, ledge, mud rounded; platform squared) so no existing level changes; editor draws the real footprint (real width incl. the game's 1.5 margin, real end shape). Game facts: gap/ledge = discs r = w/2+1.5 every 3 units (ledge half min 1.3), mud = discs r = path half-width+1, platform = exact square mesh, collision square +1.15 at each end. (My earlier note said platforms were round in game: wrong, they are square. Tell Ricky.)
Q11: no. Q12: not a concern.
EXTRA FIX found doing 7: applyStats used to overwrite TURN_R (= top speed^2 / grip), but TURN_R is Grass Canyon's big-curve radius; ARC_CX etc. were fixed at load, so any Top speed or Grip stat other than the defaults walled the curve off (checked: floor 0.1-22.6 became 45.6 rock in the old build; fu1c.py). TURN_R is no longer touched by stats. Tell Ricky.
Stat card now has 12 tiles (adds Gravity, Wall grip, Friction) + a 'Grip on slopes' row. Movement details follow gravity, grip (Zips), both toggles; 'units a second' -> Zips.
RESUMED Nov 13 11:50 PM after a usage-limit stop; nothing of the follow-ups was coded before this point.

## Progress
- [x] 1 Static scan
- [x] 2 Path Editor (segment fuzz 840 cases, object stamps 25 tools, both 0 bad)
- [x] 3 Rig Editor (edge cases, seams, hip and shoulder welds)
- [x] 4 In-game mechanics / visuals (Oceana decks rewritten and verified)
- [x] 5 Regression + report

## v176 (Nov 14): features
- SEGS counter split from the Power Line (segTotal, cap 999; addSegs). Slam stats stat.slamAcc / stat.slamMax.
- Mud anywhere (follow=false: heading, bend, width; B.maxM search radius; fixed a mud-tint miss at grid cell edges).
- Toxic ledges / platforms (o.tox; ledTox from sbLedge; onTox damage in sbTick; bubbles).
- Gradual slopes: per-segment sm / smL; vcurves (editor) = sbVcurves (game); tests fu/vc1.py.
- Circular decks: piece {disc:1, rad, h, cs, bk, tx, ov, fl}; sbDiscY / discY; samples flagged dsk (skipped by the ribbon ground and the Oceana deck); level3H override; Oceana disc mesh; tests fu/disc1.py, fu/disc2.py.
- Minions: MN_DEF (game) = MNE (editor), keys mn.min.* / mn.big.*; __makeMinion / __poseMinion shared by game and preview; enBuild / enRestyle on rigRead; stomp = top quarter of the head, falling; bounce stomp Zips per kind; Barrier damage tiers k1/k2/k3 (0 = never). Tests fu/mn1-4.py.

## v179 (next, unreleased)
- Grass Canyon Act 1: OFFICIAL_L1 replaced with Ricky's re-edited layout (Nov 14): 1,467 stamps (1,411 trees, 17 ledges, 14 tips, 12 segchains, 1 door, 1 mud, 1 lake). Builds with 0 errors, all stamps built; reg2 unchanged. Test fu/gc_new.py.
- Pressure plates (type 'plate': shape, radius / width / length, look gray|brown|halo|none, onlyWhileStanding) and targets (type 'target': size, post, height = its middle above its Y, tilt, spin, hitbox ×, breakSpeed Zips, sideTravel/sidePeriod, upTravel/upPeriod, phase). Game: B.plates, B.targets, B.trig (id -> plate/target, used by sbDoorLinked), sbTrigMeshes, sbTrigTick (in sbTick: plates, moving targets, falling halves), sbTargetHit (after updateEnemies, i.e. after she moves: swept from B.tgP), sbTrigReset (from sbPlaceEnemies). Tests fu/trig1.py, fu/pe_trig.py.
- Editor: every new stamp gets noat = true unless that kind was set to Snap; mk() turns a free stamp near the path to face along it. Mud and Seg chains stamp on their own curve.
- Comet (v179): CHAR ('molly'|'comet', localStorage pr_char), setChar, rigStored/rigCfgFor (Comet's dials in cometRig, falling back to runnerRig2; mn.* always from runnerRig2), glbKey (mollyGlb / cometGlb in IndexedDB), loadCharModel. COMET_DEF (window.__COMET_DEF feeds the Rig Editor's DEF). Star Throw: starPress / starRelease / cometInput (charge, Power, cooldown in game time) / cometStars (after movement: mobs the game is running, targets via sbTargetDist + tg.hp, ground). Aim: camera yaw; level at the camera's resting pitch 0.35, up or down from there (literal camera direction would dive into the ground at the resting tilt). Hover: hovOn, applyStats swaps in comet.hov.*, body lifted comet.hov.height, gates on mud, toxic (6 sites), pressure plates, landFall. Fly: flyOn = hovOn && !grounded && spaceDown, gravity × (1 - lift). cometPose: ankle/back stars on bones AnkleL/R, Spine, WristL/R; Fly arms from cometRest. Tests fu/comet1.py, fu/rigpages.py.
- Rig Editor pages (PAGE, CHAR, CHARKEY, loadChar, setPage); Mobs page (#mobBox, MOB_KINDS). Drift: poseDrift = Fast run + dA.* offsets; preview leans rigRoot from the feet; export Drift_L/R from poseDrift with userData.driftRun; the game plays them (on the shared stride phase) only for a model that carries driftRun. Test fu/drift2.py.
- v180 (next): Comet's animations are dial sets read live by the game (no clips): window.__cometQ (dial set -> one bone's turn, the Rig Editor's key-pose rules) and __cometMirror shared by game and editor. Groups comet.pc/pt/pf (upper-body poses: cqOver slerps the bone to rest x pose), comet.ho/fl (changes: cqAdd). Throw timeline thrPh 1 charge, 2 swing (star spawned from her hand at throw.rel of the swing, spawnStar), 3 hold, 4 out; Q mirrors. Held star heldStar; aim marker cometAim (DOM #starAim, projected end of range or ground hit). applyCharColors (Power line, charge bar, Seg icon, segMesh/segGlow hue to comet.cStar's). Editor: modes cThrow/cHover/cFly (.cometOnly), poseComet, cometPreview (stars at bones, k = model height / 3.6). Tests fu/comet2.py, fu/comet_anim.py.
- v180 (next): shipped defaults are the molly-settings and comet-settings script tags (comet-settings has no mn.*). Game: SHIPPED + rigPick (stored, then shipped, then the built-in RIGCFG numbers; mn.* always Molly's). Built-in models molly-glb and comet-glb are baked by tools/bake_models.py (headless Rig Editor export from the shipped settings; rerun it whenever the shipped settings change). Editor: DEFM / DEFC per runner (DEF swaps in loadChar), noMobs on Comet's store, pageOf, settingsJson copies {molly, comet, mobs}, applyAll. Test fu/defaults1.py.

- Nov 15 2026: Path Editor: toxic patches now have editable Width (across) and Length (along) fields in the inspector (the model, export and game already carried them; only the fields were missing). Edited path-editor.html, embed regenerated.
- Nov 15 2026 (v181): version label bumped to v181 at Ricky's request, CHANGELOG entry added for the toxic patch Width/Length fields. BACKLOG: logged the "next ledge" edit bug and the next-stamp fields matching the placed-stamp fields.
- Nov 16 2026 (v182, next, unreleased): Path Editor: mk0 reset Bend to 0 for strip stamps, so the next-stamp Bend never carried (fixed, tests/penext.py); next-stamp panel gets Rotation for non-strip stamps and loses the dead Heading box on mud; Big Minion Placement select removed (trapped layouts still load, export and play; tests/penext_bm.py). Game: #start now justify-content: safe center, so a menu screen taller than the window starts at its top (the Characters card was cut off; measured at 4 window sizes). New stat stat.strafe (STRAFE_DIST, default 2 units = TILE, floor 0.25; tests/fu/strafe1.py). Wall-stop bug not reproduced (head-on ledge face stops her); left in BACKLOG with questions.
- Nov 16 2026 (v182): Game: stuck-after-glancing-hit fixed. In the step loop, a ledge or crag face (`ledgeHit`) rejects the step and restores her position; with `bdn >= 0` (moving along the face, or its widely sampled normal pointing away, e.g. at ledge corners) neither the penalty nor the slide branch ran, so she stood pinned with speed still on. Now `else if (ledgeHit) { speed = 0; stepLen = 0; blocked = true; }`. Test tests/fu/wall4.py: 33 glancing approaches, 2 stuck before (one at 147 u/s), 0 after; reg2, fu/ends1, fu/fu1b clean. Ricky's report: usually ledges or crags at an angle, speed cut once then only friction and inputs.
- Nov 16 2026 (v182): Path Editor inspector tidy-up (path-editor.html: SLOT / SHORTL / SHORTT / OPTS / tidyInsp, run on the HTML renderInsp builds; no field names or saved data changed). Two-column grid (`.fields.std`); fixed slots: noat|layer, X(s)|Z(u), rot(th, turn)|ya, len(d, r)|w, hgt(h)|bend; other boxes follow in order, with placed-only boxes (Link, Shape, Angle from, notes with buttons) last so the next-stamp panel and a placed stamp agree. Labels one or two words; the original text is the tooltip; option text shortened (OPTS or text before ( : —, full text in title); plain-text notes became the title's ⓘ tooltip. Test tests/peinsp.py (three random kinds, seed printable): label length, slots, next vs placed, overflow, typed value; passes on 8 seeds.
- Nov 16 2026 (next, unreleased): Toxic patch performance. `level3H` and the patch damage check in `sbTick` now look patches up through `B.toxH` (`sbHash(TOX_C=32)`, each patch filed in every cell its square reach `rr` covers; `sbToxAt(B, ex, z)` returns the cell's list) instead of scanning all of `B.toxic`; each patch carries `cn`/`sn` (cos/sin of -th). `sbToxBubbles` builds `t.bub` once per patch (7 numbers a bubble: world x, base y incl. sbFoot ground, z, speed, phase, size, spin) instead of calling `sbFoot` for every bubble every frame. `sbMakeMeshes` merges all patches into one mesh (`toxPos`, one material). Same geometry, damage and bubbles. Test `tests/fu/toxperf.py`; with 1500 patches the JS profile went from ~190 to ~70 ms per frame headless (draw calls stubbed), 40000 ground lookups 277 -> 118 ms with 400 patches. Not done: big patches still mesh at up to 300x300 cells; toxic terrain-patch and toxic-ledge bubbles still call groundH per bubble per frame.
