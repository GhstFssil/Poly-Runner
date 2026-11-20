# History
Append-only record of every change to this repo since 2026-11-20. Never edit or delete a line; correct a mistake with a new line. Sessions don't read this file unless Ricky asks. Times are America/Chicago.
Format: `- YYYY-MM-DD HH:MM | branch or version | what changed (and why, briefly)`
Add a line with `echo '- ...' >> HISTORY.md`. Nightly sweeps tag theirs `nightly-<sweep>`.

- 2026-11-20 17:10 | main | Added HISTORY.md (append-only change record) and .gitattributes (union merge so parallel branches keep every line)
- 2026-11-20 17:10 | main | CLAUDE.md reorganised into the common sections (Session economy, Docs, Testing, Project, Shipping, Rules maintenance); first-person wording now third person; added HISTORY, overwrite-only HANDOFF and BACKLOG format rules; audit-notes.md frozen (HISTORY.md continues it)
- 2026-11-20 17:10 | main | SWEEP-BUGS/EDGES/PERF: each nightly sweep now appends its own line (tag nightly-<sweep>) to HISTORY.md; the audit-notes rule now says frozen
- 2026-11-20 17:10 | main | HANDOFF.md moved to the common headings (Goal/Done/In progress/Decisions/Next steps/Gotchas) with a Last updated line; BACKLOG.md header gets the common wording, the Done recently pointer is removed; README.md expanded (Run, Test, Updating, Files); ARCHITECTURE.md gets a What line, Docs section and the HISTORY merge note
