---
description: Move the notes of the analysis notebook along their journey — every note, or the one named — advancing each by the steps the notebook autopilot policy lets an agent take, until a person must decide or nothing is left.
argument-hint: '[note-id] | all | inbox <folder>'
disable-model-invocation: true
---

# /notes-run — advance the notes

Advance the notes of the project's analysis notebook. Arguments: `$ARGUMENTS`

First load the skill `caip-analyst-journey` (`skill_read(kind="skill", name="caip-analyst-journey")`,
or the runtime's own skill loading) and follow its *Run the notebook* procedure.

- `all` or no arguments — read the board with `caipNotesJourney` and work every note that has a
  next step.
- `<note-id>` — work that note only: `caipNotesJourney({ noteId })`, then `caipNotesAdvance`.
- `inbox <folder>` — feed the notebook inbox instead: follow the skill's *Feed the inbox* procedure
  for that workspace folder, then stop. It advances no note.

For each note, loop `caipNotesAdvance({ noteId })` until the answer says a person must decide
(`needsPerson: true`) or nothing is left. When no note has a step the agent may take, stop at once
and say so in one line. Never invent an answer to an analyst question. End with a report per note:
where it stopped and why.

You change the notebook only through the `caipNotes*` tools, and only as far as the policy lets
an agent go. You never edit the notebook, the proposals, the policy, the team file, a requirement,
the model, code or tests by hand.
