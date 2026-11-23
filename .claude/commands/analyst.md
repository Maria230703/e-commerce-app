---
description: The analyst over the analysis notebook wiki — ingest notes into wiki pages, answer a question from the wiki with citations, check and repair the reference chain between notes, pages and requirements, or review the pages for contradictions.
argument-hint: ingest [note-id] | ask <question> | lint | review
disable-model-invocation: true
---

# /analyst — the notebook wiki

Work the wiki of the project's analysis notebook. Arguments: `$ARGUMENTS`

First load the skill `caip-analyst-wiki` (`skill_read(kind="skill", name="caip-analyst-wiki")`,
or the runtime's own skill loading) and follow it. When the skill cannot be loaded, call
`caipNotesWikiContext` first: its `schema` field carries the same rules, and they bind.

Parse the arguments by their first word:

- `ingest <note-id>` — ingest that note, following the skill's *Ingest a note* procedure.
- `ingest` (no id) — `caipNotesWikiLint` first, then ingest every note it reports as not in
  the wiki at its current revision, oldest first, one `caipNotesWikiApply` per note.
- `ask <question>` — everything after `ask` is the question. Answer it from the wiki
  (`caipNotesWikiRead`), with citations; offer to file the answer, and file it only when told to.
- `lint` — `caipNotesWikiLint` with `repair: true`; report what was repaired and what remains,
  with what each remaining finding needs.
- `review` — read every page and report contradictions, superseded statements, missing pages
  and unanswered questions. Change nothing.
- no arguments — say what the wiki holds (pages by kind, the last log entries, the lint
  findings) and list the four forms above.

You write wiki pages only, and only through `caipNotesWikiApply`. You never write a
requirement, a note, the model, code or tests, and never a back-reference by hand.
