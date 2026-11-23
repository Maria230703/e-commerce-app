---
applyTo: "**"
---
# The CAIP workbench — what the user means by its names

The CAIP extension adds surfaces of its own to this workspace, and the user calls them by name:
"ask EDI", "run AI Doctor", "look in AI Insights", "open the Notes page in DevTeam". These names
belong to the tooling, not to this project's code: do not search the repository for them. Read
what each one is below, and reach it through the tool, view or command named next to it. When a
tool you need is not exposed in this session, say which one is missing. Do not guess its effect.

## The assistant in the running page — EDI, Volt and Fuse

Every CAIP application running in development carries the **CAIP Cockpit**: a panel the extension
injects into the page (`caep.cockpit-inject` adds the hook to a client, `caep.cockpit-remove`
removes it). An assistant stands in its corner, and the DevTeam dashboard has the same one. It is
one assistant with three characters: **EDI** (the light bulb), **Volt** and **Fuse**. The user
chooses which one is shown, and they are not three agents. When the user says "EDI" they mean
that assistant, and the page it is in.

What it gives an agent, on the RUNNING page:

- `caipCockpitStatus` tells you where the page is and who it is being: route, identity, roles,
  claims and simulated settings.
- `caipCockpitSetIdentity` makes the application be somebody else (development only), and
  `caipCockpitProfile` works the saved situations.
- `caipCockpitRead` reads the fields and controls; `caipCockpitAct` fills and clicks them as a
  person would; `caipCockpitPour` puts in values read elsewhere, with where they came from.
- `caipCockpitErrors` lists what the page caught: exceptions, rejected promises, console errors
  and failed HTTP calls.
- `caipCockpitInspect` hands elements to the AI Assistant, and `caipCockpitPage` moves to a route
  or opens in VS Code what is behind the page (source, template, C4 node, requirements).
- `caipCockpitSay` makes the assistant speak. Use it to narrate what you are doing while you do
  it. It is never a substitute for your report.

## AI Doctor — when something does not start or throws

AI Doctor hands what is broken to the AI Assistant: build errors, runtime errors of the page and
of the services, and why a unit stopped on start. Reach it with `caep.aspire-ai-doctor` (also on
the App Hosts title bar). For one unit that failed at startup, use `caep.uhost-fix-startup`.

Its contract is triage before repair. A DEFECT is fixed. A LEGITIMATE error is explained, never
patched: the application answering as designed, such as 401/403, a rejected validation or a
business rule. If the user wants that case to behave differently, the path is a change request
on the requirement. When you receive an AI Doctor hand-over, report three things: the defects
you fixed, the legitimate errors you explained, and the change requests you drafted.

## App Hosts — the units of the workspace, running

The **CAIP - App Hosts** view lists every runnable unit the model declares: services, clients,
databases and Docker containers. For each one it shows the unit's state, its port and its logs.
- Start, stop and restart units: `caep.uhost-run`, `caep.uhost-stop`, `caep.uhost-restart`.
- Restart on change: `caep.uhost-watch`.
- Read a unit's logs: `caep.uhost-logs`.
- Open the control panel: `caep.uhost-menu`.
- Declare targets the model does not carry: `caep.uhost-init`, which writes `.caep/targets.json`.

A title such as `not running · nothing to watch` is a state the view is reporting. It is not a
fault.

## AI Insights — what the AI runs did

The **CAIP - AI Insights** view shows every AI pipeline run live:
- its stages, with the model of each and its outcome;
- the per-test detail;
- regressions: a test green on the last run and red now.

A loop you drive appears there only if you open and close it:
- open the run with `caipPipelineRunBegin`; declare its stages with `caipPipelineRunPlan`;
- bracket each stage with `caipPipelineStepBegin` and `caipPipelineStepEnd`;
- record what happens inside a stage with `caipPipelineStepEvent`;
- close the run with `caipPipelineRunEnd` on EVERY outcome. A run left open reads as running
  forever.

## The AI Assistant — the chat inside VS Code

The **CAIP - AI Assistant** view is the extension's own chat. It holds:
- parallel threads;
- memories, reached with `caep.aiChat.memories`;
- context chips;
- the conversations that AI Doctor, AI Insights and the cockpit hand over.

Several CAIP features first write their request into the Assistant's composer, and the user
reviews it there before sending. A request already in the composer is the user's to send.

## DevTeam — the dashboard of the workspace

DevTeam is a web dashboard served by the extension's gateway. It can be opened in a browser,
in VS Code, or from a remote machine:
- open it with `caep.devteam-launch`;
- start or stop the gateway with `caep.devteam-start` and `caep.devteam-stop`.

Its pages:

- **Chat** — the conversation with the workspace's assistant.
- **Overview** — the state of the workspace, with the team.
- **Notes** — the analysis notebook, where notes become requirements. Each note travels eight
  stations: captured, understood, clarified, proposed, agreed, specified, built, verified. An
  autopilot can carry notes along within the gates and budgets the analyst sets.
  - `caipNotesJourney` reads a note's journey.
  - `caipNotesAutopilot` reads the autopilot's status, or stops it.
  - `caipNotesCapture`, `caipNotesAdvance`, `caipNotesReview`, `caipNotesAnswer`,
    `caipNotesDecide`, `caipNotesReset` and `caipNotesDismiss` act on notes, only within that policy.
  - `caipNotesInbox` puts a document into the notebook inbox, within the day's cap.
    The `/notes-run` command runs the notebook (`/notes-run inbox <folder>` feeds the inbox).
  - `caipNotesWikiContext`, `caipNotesWikiRead`, `caipNotesWikiApply` and `caipNotesWikiLint`
    work on the notebook's wiki.
  Whether to accept a requirement stays a person's decision unless the policy says otherwise.
- **Requirements** — the Gherkin requirements and where each one stands.
- **Decisions** — what is waiting for a person: approvals and questions. You never resolve
  someone else's decision.
- **Model** / **Architecture** — the C4 model and its modeler, the same one the
  `caipC4Modeler*` tools drive.
- **Git** — the repository, as a forge shows it.
- **Hosts**, **Publish**, **Connections**, **Terminal** — the hosts and environments of the
  workspace, publishing to them, the connections, and a terminal on this window's own hosts.
  Production stays behind a confirmation in the page.
- **Run tests**, **Verify UI with AI**, **Generate and verify** — the test battery, and AI UI
  verification. That verification runs on the `caipUiVerifyStart` … `caipUiVerifyEnd` tools,
  only against environments declared `test` or `development`.
- **Agents** — the agent team:
  - its members, skills and schedule;
  - its mailbox and plans;
  - **Triggers**: what starts work when something happens, and the gates that hold an action
    until a person approves it.
  An agent never approves its own gate. **Chats** keeps the past conversations.

The dashboard has an F1 help on its controls. When the user asks how a page works, the page's
own help is the authority. Do not describe from memory a control you cannot see.
