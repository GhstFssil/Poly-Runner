# Nightly sweep: visual and behaviour edge cases

Purpose: every night this sweep runs what one slice of the code does, headless, pushes it to its edges, and looks at the result and the behaviour; it fixes only what is clearly broken. The code is cut into 20 slices of about 5% each, and the sweep takes the next one each night, so a night's run stays cheap. Two other sweeps run on their own nights and branches with other jobs; this file covers only visual and behaviour edge cases.

This file is the whole job for the unattended run. Read it as cloned from `main`, before switching branches; the base branch may carry an older copy, which you ignore. Do not read the other `SWEEP-*.md` files.

## Unattended rules
- Nobody is watching: never ask. Decide, or leave the thing alone and write the question for Ricky (see "For Ricky").
- From CLAUDE.md, these do not apply tonight: the session-start summary, naming files before a big read, proposing a plan and waiting for a go-ahead, and the closing reply style. Everything else in CLAUDE.md does. It loads by itself when the repo is registered: don't read it again.
- Git identity: `git config user.email noreply@anthropic.com` and `git config user.name "Poly Run nightly sweep"`. Never use or write Ricky's email anywhere. Commit messages end with the attribution lines this session was given; if none were given, end with `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Never: change features, physics, tuning numbers, level content, looks or design; reformat or refactor; bump the version label; add a CHANGELOG entry (that comes when Ricky merges, see ARCHITECTURE.md) or touch `audit-notes.md` (frozen); send a zip or publish anything.
- On `main`, the run only appends to `.md` docs (never rewrites them, never sweep reports or state files), mainly the "For Ricky" lines in BACKLOG.md, then merges `main` into `next` (below). Everything else goes on tonight's branch.
- HISTORY.md: every night, append one line for tonight with `echo '- YYYY-MM-DD HH:MM | nightly/<name> | nightly-edges: slice N; what you fixed (or "nothing found"); report sweep-reports/<name>.md' >> HISTORY.md` (America/Chicago time). Commit it with the report on tonight's branch, and add a line in the same commit as the `main` append described under "For Ricky". Never read, edit or delete earlier lines.

## Names
- This sweep's tag: `edges`. Tonight's branch: `nightly/YYYY-MM-DD-edges` (today in America/Chicago). Its `<name>` is the branch name without `nightly/`, for example `2026-11-18-edges`.
- State: `sweep-reports/STATE-edges.md`. Report: `sweep-reports/<name>.md`. Screenshots or other files: `sweep-reports/<name>/`.

## State
`sweep-reports/STATE-edges.md` lives on this sweep's nightly branches, not on `main` until Ricky merges one:

```
Next slice: 7

## Tests added by nights
- (area): tests/name.py, what it checks (nightly/<name>)
```

Read it from the base branch. If the base has none (the first night, or every branch of this sweep is merged and none has reached `main` yet), start at Next slice 7 with an empty test list.

## What a nightly session does
1. **Choose the base.** Run `git ls-remote origin 'refs/heads/nightly/*'` and keep only this sweep's branches (names ending `-edges`, or `-edges-2`, `-edges-3` and so on). Take the newest (sort the names). It is merged if `main` has its report: `git cat-file -e origin/main:sweep-reports/<name>.md`. If it is merged, or this sweep has no branches yet, the base is `origin/main`. Otherwise fetch it (the clone is single-branch, so always name the remote ref like this): `git fetch --depth=1 origin nightly/<name>:refs/remotes/origin/nightly/<name>`, and use that.
2. **Create tonight's branch.** If `nightly/YYYY-MM-DD-edges` is already in the list from step 1, add `-2` (or `-3`, and so on). `git switch -c <branch> <base>`, then `sh tests/setup.sh`.
3. **Get the slices.** Run `python3 tools/reslice.py --check` (always with `--check`: it prints the table and writes nothing). Take the row numbered "Next slice". Also look at the slices for this sweep's next three nights (Next slice + 1, + 2, + 3; after 20 comes 1): any that is over 7% of the code goes in tonight's message. Slice 5 is about 12.5% (one long section the tool can't cut); leave it as it is.
4. **Read the slice.** Read all of its code. A slice is a starting point, not a fence: if something in it leans on code elsewhere (a helper, a shared value), read that too.
5. **Do the work** (below), with the tests that fit the area (below).
6. **Close the night.** In `sweep-reports/STATE-edges.md`: "Next slice" + 1 (after 20 comes 1), and add any test you wrote to "Tests added by nights". Write the report and tonight's HISTORY.md line. Commit, then push: `git -c push.negotiate=true push -u origin <branch>`. Write the "For Ricky" items to BACKLOG.md (below). Then send the message (below).
7. **If a usage limit stops you**, write the slice and step you reached in the report, still update the state file so the next night continues from the right place, and push whatever is safe.

## The work: visual and behaviour edge cases
This sweep watches the game run rather than reading for bugs (the bugs sweep does that). Find out what the slice draws or does, then drive it headless to its edges and check both what it looks like and how it behaves.

**Edges to try** (pick the ones that fit the slice):
- Limits: the ends of a level or of the world, the first and last piece of a path, the smallest and largest values a dial or setting allows, zero, empty and one-of-something cases (an empty layout, a single stamp, many overlapping ones).
- Transitions: pause and resume, respawn, checkpoint, level switch, the five-minute clock running out, opening and closing an editor, saving and loading.
- Extremes in play: top speed, steep and near-vertical slopes, walls, caves, landing from great heights, strafing into things, inputs pressed together or very fast, a dropped frame (a long time step).
- The editor: undo and redo at both ends, copy and paste of nothing or of everything, presets and layers at their limits, a layout the game must still load.

**Look for, on screen** (render from several close-up angles; screenshot helpers: `tests/rv*.py`, `tests/shot.py`, `tests/fu/modes.py`): cracks or gaps between meshes, holes, z-fighting or flicker, stretched or flipped faces, T-junctions, lighting seams, wrong normals, pop-in, objects floating or sunk, colour breaks at joins, jagged silhouettes where it should be smooth.

**Look for, in behaviour**: Molly falling through or sticking in things, getting stuck in a state (still "held", still hurt, still paused), values running away or turning NaN, the editor and the game disagreeing about the same layout, anything that differs after a save and reload, errors in the console.

Fix only a clear fault with one obvious cause, locally, with a test that shows it (for something visual, before and after screenshots in `sweep-reports/<name>/`, plus a test where one can be written). If the fix would change how something is designed or how it plays (a shape, a colour, a size, a speed, a rule), do not change it: it goes to "For Ricky" with the screenshot's path or the exact steps. If a slice has nothing to see, check behaviour only.

## Testing rules
- After every edit: if you touched `path-editor.html`, run `python3 tools/mk_pe_embed.py` first. Then `python3 tests/chk.py && python3 tests/mk_test.py` (this rebuilds the test copy; without it the tests run on the old game). Then, from inside `tests/`, the tests for the area and `python3 reg2.py`.
- Commit only when all of those pass. If a fix makes anything worse, undo it. After two failed attempts at the same fix, undo it and write it up in the report.

## Tests by area (run from inside `tests/`)
- Path Editor (`path-editor.html`): `peobj.py`, `pesave.py`, `pecycle.py`, `pegho.py`, `pefuzz.py` (several minutes: run it last).
- Sandbox and levels (`sbBuild`, footprints, caves, walls): `fu/ends1.py` plus a test of your own for what you touched.
- Stats and movement details: `fu/fu1.py`, `fu/fu1b.py`.
- Rig Editor dials, loading and settings: `rx8.py`, `fu/fu2.py`, `fu/fu4.py`; model build, welds and weights: `rw4.py`, `rm1.py`, `fu/fu3.py`; saved model storage: `fu/fu6.py`.
- Plus every test in the state file's "Tests added by nights" for the area.

## For Ricky
Anything that might be a bug but might be intended, or needs a decision (including design, tuning and bigger ideas), is not changed. Write each one in tonight's report, and also append it to BACKLOG.md on `main`, under "## Nightly sweep suggestions", as one line: `- (nightly/<name>) the question, in plain words; where in the code`. Don't repeat an item that is already there. If another doc on `main` needs a note, append it the same way, in the same commit. Then merge `main` into `next`. Do all of it in a separate worktree so tonight's branch is untouched:
```
git fetch --depth=200 origin main:refs/remotes/origin/main next:refs/remotes/origin/next
git worktree add --detach /tmp/pr-main origin/main
(append to /tmp/pr-main/BACKLOG.md, that section only, any other .md note, and one HISTORY.md line with `>>`)
git -C /tmp/pr-main commit -am "Nightly <name>: notes for Ricky"      (message ends with the attribution lines)
git -C /tmp/pr-main -c push.negotiate=true push origin HEAD:main
M=$(git -C /tmp/pr-main rev-parse HEAD)
git -C /tmp/pr-main checkout --detach origin/next
git -C /tmp/pr-main merge --no-ff -m "Merge main into next (nightly <name>)" $M      (message ends with the attribution lines)
git -C /tmp/pr-main -c push.negotiate=true push origin HEAD:next
```
If the push to `main` is refused because `main` moved (another sweep may have just pushed), fetch again, redo the append on the new `main` and retry once; if it still fails, say so in the message (the items are in the report either way). If the merge into `next` conflicts or fails for any reason, run `git -C /tmp/pr-main merge --abort`, leave `next` alone and say so in the message; never resolve a conflict on `next`.

## The report and the message
- The report file (`sweep-reports/<name>.md`): the slice and what it covers, what you looked at, what you found and fixed with its test, numbers and screenshots where they apply, what you left for Ricky, any limit you hit, and any setup oddity (for example, a clone that was already there).
- The message: your final message, and a SendUserMessage call with the same text. Plain language for Ricky, no code or jargon, about 15 lines at most: which sweep this is (visual and behaviour edge cases), the date and branch, the slice (and what part of the game it covers), what you found, what you fixed (one line each), what you left for him and why (and that it is in BACKLOG), anything you could not finish, and any slice over 7% coming in this sweep's next three nights. If you found nothing, say so plainly.

## Known leftovers (not bugs to chase)
Ponytail blend at max opens a slit at the hair tie; Contour shift at max falls back to the old arm joint with a few holes; a soft fold at the top of the trailing thigh in deep strides.
