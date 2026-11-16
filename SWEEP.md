# Nightly sweep

Purpose: every night, one slice of the code (about 5% of it, 20 slices in all) is looked at through one lens (bugs, visual seams and edges, or running lighter and smoother), tested, and fixed only where the fix is proven and safe. A slice is small enough that a night's run stays cheap.

## State (updated by each night, on its branch)
Next slice: 2
Night counter: 1
Last checked commit: 0347d07c1f6ae1cec07defe1345ceb65a918d8e3

## What a nightly session does
1. `git fetch`; choose the base (see ARCHITECTURE.md, Branches: newest unmerged `origin/nightly/*`, else `main`); create `nightly/YYYY-MM-DD` from it; run `sh tests/setup.sh`.
2. **Re-slice if the code changed.** Run `git diff --stat <Last checked commit> HEAD -- checker-run.html path-editor.html`. If anything changed (any edit by anyone since that commit, including earlier nights' fixes that were merged), run `python3 tools/reslice.py`. It cuts the code into 20 slices of about 5 percent each, at section and function boundaries, and rewrites the table below. Do not move "Next slice": tonight simply takes the slice with that number in the new table (so new code lands in whichever slice it falls in and is reached in its turn; nothing is put at the front of the line). If nothing changed, keep the table as it is.
3. **Take the slice** numbered "Next slice". Read all of its code. A slice is a starting point, not a fence: if something in it leans on code elsewhere (a helper, a shared value), read that too.
4. **Pick the lens** for tonight: cycle[Night counter mod 7] where the cycle is Bugs, Bugs, Visual, Bugs, Bugs, Performance, Bugs. (Seven nights, so over time every slice meets every lens.) If the lens makes no sense for the slice (Visual for code with nothing to see, such as import/export, menus and input; Performance for code with no hot path), use Bugs instead; never skip a slice.
5. **Do the work** under that lens (below), with the tests that fit the area (below).
6. **Close the night**: set "Next slice" to the next number (after 20 comes 1), add 1 to "Night counter", set "Last checked commit" to the commit your branch is on once your code changes (if any) are committed (code commits only; the bookkeeping commit that records it does not matter, since the diff looks only at the two code files), write the report to `sweep-reports/YYYY-MM-DD.md` (what you looked at, found and fixed with its test, numbers for performance work, screenshots beside it for visual work, what is left for Ricky, any limit you hit), commit and push the branch. If a usage limit stops you, write down the slice and step you reached in the report and push what is safe, and still do the state update so the next night continues from the right place.
7. Never: change features, physics, tuning numbers, level content, looks or design; reformat or refactor; bump the version label; send a zip or publish anything. If something might be a bug but might be intended, or needs a decision, do not change it: write it under "For Ricky".

## Lenses
**Bugs.** Read for wrong math or units, off-by-one, null or NaN paths, state that is not reset, swallowed errors, mismatches between the editor and the game, event handlers that leak, values that can leave their range, code that disagrees with its own comment. For each suspect, prove it: write a small test (headless, from `tests/`) that fails, or show the exact input that goes wrong. Fix only a proven bug, with the smallest change, and keep the test. If a fix makes anything worse, undo it.

**Visual (seams and edges).** Render the slice's content headless from several close-up angles (the harness has screenshot helpers: `tests/rv*.py`, `tests/shot*`-style scripts, `fu/modes.py`) and look for: cracks or gaps between meshes, holes, z-fighting or flicker, stretched or flipped faces, T-junctions, lighting seams, wrong normals, pop-in, objects floating or sunk, colour breaks at joins, jagged silhouettes where it should be smooth. Fix only a clear artifact with one obvious cause, locally. Save before and after screenshots to `sweep-reports/YYYY-MM-DD/`. If a fix would change how something is designed (a shape, a colour, a size), do not change it: put the screenshot and your suggestion under "For Ricky".

**Performance (lighter and smoother, same behaviour).** Headless software rendering says nothing about real GPU speed, so measure only what it can: JavaScript time per frame and per build (`performance.now()` around terrain chunks, sandbox builds, rig rebuilds, the main update), allocations inside per-frame code (new objects, arrays, strings, closures made every frame), repeated work that could be cached, draw calls, triangle and material counts, texture and geometry sizes, anything that scales badly. Make a change only if (a) it saves a measurable amount, (b) the output is provably the same (identical positions, heights, sample values or screenshots before and after, plus the related tests) and (c) it is small and local. Record before and after numbers in the report. A bigger idea (a restructure, or anything that changes how something looks or feels) goes under "For Ricky" with the estimated gain and the risk, never into the code. Never trade away behaviour, accuracy or looks for speed.

## Tests by area (always run `python3 tests/chk.py` and `tests/reg2.py` before committing)
- Path Editor (`path-editor.html`, and after any change run `python3 tools/mk_pe_embed.py`): `peobj.py`, `pefuzz.py` (takes several minutes), `pesave.py`.
- Sandbox and levels (`sbBuild`, footprints, caves, walls): `fu/ends1.py` plus a test of your own for what you touched.
- Stats and movement details: `fu/fu1.py`, `fu/fu1b.py`.
- Rig Editor dials, loading and settings: `rx8.py`, `fu/fu2.py`, `fu/fu4.py`; model build, welds and weights: `rw4.py`, `rm1.py`, `fu/fu3.py`; saved model storage: `fu/fu6.py`.
- Run tests from inside `tests/`. After every edit to the game, rerun `python3 mk_test.py` first.

## The slices
Generated by `python3 tools/reslice.py` (counts every line of both files except the generated Path Editor embed, Molly's saved model and settings, and the change log's text). Do not edit by hand.
<!--SLICES-BEGIN-->
| # | Where | Size | Sections inside |
|---|-------|------|-----------------|
| 1 | path-editor.html 1-375 | 375 lines (4.3%) | the path: points every 4 units, heading 0 = north (-Z), a right turn s |
| 2 | path-editor.html 376-836 | 461 lines (5.2%) | shapes (in the stamp's own frame: x across, y toward the back; up on t; Layer-Split Overlap ----; drawing ----; the piece list ---- … |
| 3 | path-editor.html 837-1213 | 377 lines (4.3%) | events ----; copy, paste, delete, duplicate for one stamp or a whole selection ---- |
| 4 | path-editor.html 1214-1408; checker-run.html 1-262 | 457 lines (5.2%) | presets: a saved group of stamps you can drop anywhere, on any level -; layers (editor only: the game never sees them) ----; the ground under the layout: read from the game's own terrain code, so; live preview: when the editor is hosted by the game with Live preview  |
| 5 | checker-run.html 263-623, 3124-3166 | 404 lines (4.6%) | (code inside one section) |
| 6 | checker-run.html 3167-3549 | 383 lines (4.3%) | keyframed moves. Angles in degrees. Missing values carry over from the |
| 7 | checker-run.html 3550-3936 | 387 lines (4.4%) | implicit field of each part, used to blend side joints and to weight v |
| 8 | checker-run.html 3937-4330 | 394 lines (4.5%) | (code inside one section) |
| 9 | checker-run.html 4331-4352, 4354-4734 | 403 lines (4.6%) | Speedometer ----; Renderer / scene ----; Valley: rolling grass between two cliff walls and a back wall, running |
| 10 | checker-run.html 4735-5139 | 405 lines (4.6%) | The cave ----; The doorway, the mud ramp and the field ----; Level 2, Oceana Crags: a flat, light brown stone runway 20 wide runnin; The Crags: a 500-wide range of brown rock spikes. Its centre line star … |
| 11 | checker-run.html 5140-5548 | 409 lines (4.6%) | Level 3, the Sandbox: flat patchy grass at x = 60000 and up, shaped by; Caves: a tunnel (or, from 80 degrees up, a shaft) bored into the groun |
| 12 | checker-run.html 5549-5962 | 414 lines (4.7%) | Walls: a path banked past 80 degrees is a tilted plane, not part of th |
| 13 | checker-run.html 5963-6415 | 453 lines (5.1%) | (code inside one section) |
| 14 | checker-run.html 6416-6914 | 499 lines (5.7%) | Trees: one per jittered grid cell, in rows running down the valley, so |
| 15 | checker-run.html 6915-7361 | 447 lines (5.1%) | Character: girl in a red jumpsuit ----; Movement details (the Rig Editor's Stats menu): the movement model wri; Head: a shaped skull with a narrowing jaw, smooth skin, then faceted h |
| 16 | checker-run.html 7362-7814 | 453 lines (5.1%) | Arms: shoulder, upper arm with a white band on the outside, forearm, b; Legs: thigh, calf with a back bulge, black knee diamond and ankle cuff; State ----; Molly's model: a low-poly rigged runner (a .glb embedded in the page)  … |
| 17 | checker-run.html 7815-8301 | 487 lines (5.5%) | Health: three hearts. A hard landing costs hearts (30+ units: one, 60+; Strafe: an instant sidestep of one square, to her right (+1) or left (; Warning sign: a wooden post and board in the middle of the platform at; Toxic patches: dark gray strips of ground, 2 wide and 100 long, along  … |
| 18 | checker-run.html 8302-8757 | 456 lines (5.2%) | Strafe streaks: thin light lines left in the air along the path of a s; Checkpoint gate at the end of the valley ----; Stone edges: a low row of rough blocks along the plateau's cliff edges; Where she starts: the start meadow or the checkpoint ---- … |
| 19 | checker-run.html 8758-9087, 9288-9449 | 492 lines (5.6%) | World map on the title / pause card ----; Input ----; the change log on the main menu. Newest first. Add an entry (and bump  |
| 20 | checker-run.html 9450-10110 | 661 lines (7.5%) | Sizing ----; Clock: five minutes, then the level starts over ----; Loop ---- |
<!--SLICES-END-->

## Known leftovers (not bugs to chase)
Ponytail blend at max opens a slit at the hair tie; Contour shift at max falls back to the old arm joint with a few holes; a soft fold at the top of the trailing thigh in deep strides.

## For Ricky (questions the sweeps could not decide)
(none yet)
