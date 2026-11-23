# History
Append-only record of every change to this repo since 2026-11-20. Never edit or delete a line; correct a mistake with a new line. Sessions don't read this file unless Ricky asks. Times are America/Chicago.
Format: `- YYYY-MM-DD HH:MM | branch or version | what changed (and why, briefly)`
Add a line with `echo '- ...' >> HISTORY.md`. Nightly sweeps tag theirs `nightly-<sweep>`.

- 2026-11-20 17:10 | main | Added HISTORY.md (append-only change record) and .gitattributes (union merge so parallel branches keep every line)
- 2026-11-20 17:10 | main | CLAUDE.md reorganised into the common sections (Session economy, Docs, Testing, Project, Shipping, Rules maintenance); first-person wording now third person; added HISTORY, overwrite-only HANDOFF and BACKLOG format rules; audit-notes.md frozen (HISTORY.md continues it)
- 2026-11-20 17:10 | main | SWEEP-BUGS/EDGES/PERF: each nightly sweep now appends its own line (tag nightly-<sweep>) to HISTORY.md; the audit-notes rule now says frozen
- 2026-11-20 17:10 | main | HANDOFF.md moved to the common headings (Goal/Done/In progress/Decisions/Next steps/Gotchas) with a Last updated line; BACKLOG.md header gets the common wording, the Done recently pointer is removed; README.md expanded (Run, Test, Updating, Files); ARCHITECTURE.md gets a What line, Docs section and the HISTORY merge note
- 2026-11-20 17:27 | next | Merged main into next (docs overhaul: common format, HISTORY.md, sweeps log to HISTORY.md; merge was clean)
- 2026-11-20 17:33 | main | Fast-forwarded main to next (groups 2-3: Roost Gazer, invulnerable mode, drift grip, minion hits, barrier lean, half heart, editor/UI polish); Ricky approved
- 2026-11-20 17:46 | main | README: removed the version label. New rule (CLAUDE.md, ARCHITECTURE.md): every push to main that touches the game, desktop/ or release tooling bumps the label in the same push (next whole number, or next decimal if it has decimals) unless Ricky says otherwise; nightly fixes keep their decimal exception. HANDOFF records that the 2026-11-20 push to main kept v184 and overwrote that release (bump to v185 pending Ricky)
- 2026-11-20 17:59 | main | Version rules: by default every push to main that isn't docs-only bumps the label to the next whole number (v184 -> v185), docs-only pushes never change the version unless Ricky says so, and nightly sweeps get one decimal per night applied when the night's first fix branch is merged (CLAUDE.md, ARCHITECTURE.md, SWEEP-*.md, README); HANDOFF updated now that Ricky accepted the v184 overwrite
- 2026-11-20 18:44 | next | removed the old procedural runner body (Character/Head/Arms/Legs, its joint animation and ponytail; about 485 lines); the glb model is the only runner. Fixed tests/mk_test.py's __molly hook
- 2026-11-20 18:46 | next | split step 0: src/manifest.json + src/index.html + tools/build.py; checker-run.html is now generated (byte-identical); mk_pe_embed.py and bake_models.py edit src and rebuild; chk.py checks the build is in sync
- 2026-11-20 21:39 | main | Docs: shipping means pushing to main as the next version; never give zips or artifacts unless asked
- 2026-11-20 22:06 | main | Docs: publish wording matches the other projects (next merged into main as the next version)
- 2026-11-21 07:59 | next | added GLOSSARY.md (terms, 'say this not that', frozen storage names); linked from ARCHITECTURE.md; entries marked proposed wait for Ricky
- 2026-11-21 08:52 | main | docs only: GLOSSARY.md added (final terms: mob not enemy, character, stat, tile, Barrier, Mud, Crags, capitalized labels); CLAUDE.md names it, says Poly Runner and characters; ARCHITECTURE.md Characters heading and stat wording; SWEEP docs say stats; BACKLOG notes the sweep generator is behind the docs
- 2026-11-21 09:10 | next | Enemy->Mob rename, Title Case Path Editor labels, src/ rules in CLAUDE.md, glossary/backlog/handoff updates
- 2026-11-21 18:14 | next | split step 1: src/index.html cut in place into src/data/* and src/unsorted/*; build byte-identical
- 2026-11-21 18:31 | next | Rotation: strips save rot, old heading still loads (commit 9962738; line missed then); dials->stats, Hedron Barrier->Barrier (hints too), tile names/wording; tests/fu/rot1.py
- 2026-11-21 18:49 | next | Title Case for 444 UI labels (Rig Editor stats, menus, Path Editor fields); tcLabel helper; test/tool label text updated
- 2026-11-21 20:35 | next | removed 13 stale tests: g_ends/pe_ends/rep (one-shot patch scripts, already applied), along/cmp173/crash/crash2/prof/scan/scan2/rw2/rw5/rw6/gc_new (inputs missing from the repo)
- 2026-11-22 08:05 | next | mobs area carved out of 04-script-b into src/mobs/mobs.js (byte-identical build); tools/check_deps.py added (warning only); v185 label and CHANGELOG entry (Next renamed, Names and wording group added)
- 2026-11-22 08:14 | next | carved ui area (first cut): src/ui/speedometer.js, health.js, menu.js; b1 split into b1/b1b/b1c; b2 tail comment moved to data/changelog.js; build byte-identical
- 2026-11-22 08:19 | next | ui second cut: src/ui/screens.js (screen handlers, Dev Mode, level map, scoring) from 06-script-d; build byte-identical
- 2026-11-22 08:25 | v186 | published next as v186: ui area cuts (src/ui), version label and CHANGELOG entry; no game change
- 2026-11-22 10:20 | next | synced next to main (fast-forward to v186 after next had been left at v185); no content change
- 2026-11-22 10:21 | next | ui cut: Path Editor host (openPE, live view, yInfo) from 04-script-b1b to src/ui/path-editor-host.js; tail of b1b is now 04-script-b1b2; build byte-identical
- 2026-11-22 10:22 | next | ui cut: Rig Editor host (openRig) from 04-script-b1b to src/ui/rig-editor-host.js; build byte-identical
- 2026-11-22 10:23 | next | ui cut: 05-script-c.js moved whole to src/ui/menu-wiring.js; build byte-identical
- 2026-11-22 10:28 | next | BACKLOG: added Tavern and Update Buttons idea (Ricky)
- 2026-11-22 10:36 | next | level2 area: Oceana Crags, Crags, Sink from 04-script-b1b to src/level2/level2.js (b1b split into b1b, b1b3); build byte-identical
- 2026-11-22 10:41 | v187 | published next as v187: ui host cuts, menu wiring, level2 area, backlog idea; no game change
- 2026-11-22 11:02 | next | level1 area: Valley, cave, doorway/mud ramp/field from 04-script-b1b to src/level1/level1.js (b1b keeps Renderer / scene); build byte-identical
- 2026-11-22 11:45 | next | sandbox area: cut Level 3 / sbBuild, Caves, Walls, Pressure plates and targets into src/sandbox/sandbox.js (byte-identical)
- 2026-11-22 14:37 | next | sandbox, level1 Trees, characters (molly, comet) and core (scene, loop) cut out of src/unsorted/ into their area files (byte-identical)
- 2026-11-22 14:37 | v188 | published: version label v188 and CHANGELOG entry for the source split (next merged into main)
- 2026-11-22 18:01 | next | split: Rig Editor cut into the characters area (rig-editor-panel.html, rig-editor-start.html, rig-editor.html); head part now 01-head + 01-head-b; game file byte-identical
- 2026-11-22 18:06 | next | split: 04-script-b1c cut by section into ui/health.js (appended), characters/molly-moves.js, level1/props.js, characters/strafe-streaks.js, core/checkpoints.js, level1/goal.js, core/spawn.js; game file byte-identical
- 2026-11-22 18:07 | next | split: page head cut into ui/page-head.html, ui/page-body.html and ui/path-editor-embed.html; game file byte-identical
- 2026-11-22 18:11 | next | split: last leftovers cut into core/start.html, core/pointer-lock.js, core/end.html, characters/molly-update.js, level1/cave-roof.js; src/unsorted removed; ARCHITECTURE file map, HANDOFF, BACKLOG updated; game file byte-identical
- 2026-11-22 19:19 | v189 | split: game-script parts reordered by area as far as load order allows (26 -> 15 area switches); full test pass, no regressions; version label v189, CHANGELOG; docs updated
