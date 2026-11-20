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
