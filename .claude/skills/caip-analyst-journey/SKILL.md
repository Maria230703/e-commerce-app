---
name: caip-analyst-journey
description: Move the notes of the analysis notebook along their journey — read the board, then advance each note step by step with caipNotesAdvance, within the notebook autopilot policy, until a person must decide or nothing is left. Use it to run the notebook unattended (/notes-run) or to push one note forward. Works only through the caipNotes* journey tools.
---

# CAIP Analyst — the journey of a note

A note of the analysis notebook travels eight stations: captured, understood (in the wiki),
clarified (the analyst's questions answered), proposed, agreed (remarks answered, owner set),
specified (items accepted as requirements), built (the loop implemented them), verified.
At every moment it has at most ONE next step. Some steps an agent may take (a transform, a wiki
ingest, an enqueue, an acceptance inside the policy); others are a person's decision. The
**notebook autopilot policy** (`.caep/notes-autopilot.json`: level, gates, budgets) decides which —
not you, and not the tool: you ask, the policy answers.

## The tools

- `caipNotesJourney` — without `noteId`: the board and every note's journey. With `noteId`: that
  note's journey, its `next` step, and `agent` — whether the policy lets an agent take it now.
  Read-only.
- `caipNotesAdvance({ noteId, dryRun? })` — takes the note's next step when the policy allows it,
  waits for it to end, and answers the journey afterwards. Refused: `performed: false`, `refused`
  names the closed gate (or the level) and the reason, `needsPerson: true`. `dryRun: true` names the
  step and the verdict and writes nothing.
- `caipNotesCapture`, `caipNotesReview`, `caipNotesAnswer`, `caipNotesDecide` — the other verbs; you
  use them only when a person or a document gave you what they record.

## Run the notebook

1. Read the board: `caipNotesJourney` with no arguments. Keep the notes whose `next` step exists
   (all of them, or only the one you were asked about).
2. If no note has a next step the agent may take (`caipNotesJourney({ noteId })` → `agent.allowed`
   false for every one), **stop at once**: say so in one line, and do nothing else.
3. For each note, oldest first, loop `caipNotesAdvance({ noteId })`:
   - `performed: true` → read the new `journey` and advance again;
   - `needsPerson: true` → **a person must decide**: stop this note and record the gate or the reason;
   - `nothingLeft: true` → the note is done for now: stop this note;
   - `performed: false` without `needsPerson` (e.g. the critic has not read the proposal yet) → stop
     this note: it is waiting, not refused; say for what;
   - an error → stop this note and record the error text, verbatim.
   Never call `caipNotesAdvance` twice on the same unchanged refusal.
4. Report **per note**: its id and title, the steps performed, the station it stopped at, and why it
   stopped (the gate or level that refused, the person it waits for, the error, or nothing left).

## Feed the inbox

Asked with `inbox <folder>` (the "Notebook inbox feed" job): put the folder's new documents into the
notebook inbox, where the inbox sweep turns them into notes. You advance no note.

1. List the folder's `.md` and `.txt` documents, oldest first. Skip the ones already put in:
   `analysis-notes/inbox/done/` and `analysis-notes/inbox/` hold a document of the same name.
2. For each one, `caipNotesInbox({ name, text })` with the file name and its text **unchanged**.
3. Stop at the first answer with `written: false`: the day's cap (the policy's `notesPerDay`) is
   reached, or the autopilot is stopped. Say which, in one line, quoting the answer's `message`.
4. Report the documents put in, and `today` of `cap`.

Never compose, summarise or merge documents: the inbox takes what a person or a source wrote.

## What you never do

- **Never invent an answer** to an analyst question. An open question is answered by a person
  (`caipNotesAnswer` records an answer someone GAVE you, quoting who or what gave it); otherwise it
  stays open and the note waits.
- Never work around a refusal: no other tool, no hand edit of the notebook, the proposals, the
  policy or `.caep/team.json`. A closed gate is a person's decision, not an obstacle.
- Never change the policy, and never mark a remark answered or an owner chosen to unblock a note.
