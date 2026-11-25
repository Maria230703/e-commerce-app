---
applyTo: "**"
---
# CAIP work cycle — requirement, model, test, code, battery, changelog (binding)

Every change to what the workspace DOES follows one cycle, in this order. It is the heart of
the method: the requirement bounds the work (no tokens spent on what nobody asked for), the
failing test proves the requirement is really exercised, and one run of the tests the change can
affect, at the end, catches its regressions. Skipping a step is not a shortcut — it moves the cost
to the next session, which has to rediscover what this one skipped.

## The cycle

1. **Requirement and model first.** Write or update the scenario through the `caipGherkin*`
   tools — minted id, tags, the two comments — BEFORE any test or code. Then check the C4
   model with the `caipC4Modeler*` tools (read-only): every actor, system, container, component
   and relationship the scenario implies must exist, checked AT THE SCENARIO'S LEVEL — a
   `@c4-component` scenario needs a component node to anchor to, a `@c4-code` one a code-level
   node; a level deeper than its anchor node is a gap, never "already covered". A feature past
   15 scenarios is split by sub-capability, each part anchored to the component that owns it.
   Gaps are proposed to the user and wait for
   authorization; no gaps is said explicitly. A requirement that already covers the change is
   cited, not duplicated.
2. **RED test.** Write the test that cites the requirement (`§REQ:<id>`). Run it before the fix
   **only when it could already pass** — it exercises code that exists (a regression test of a
   bug, an assertion changed on a behaviour already implemented): then it must be **seen failing**
   for the reason the requirement states, because a test never seen red proves nothing. A test
   that is **certain to fail** is not run: the code it calls does not exist yet, or is a stub that
   only throws (`NotImplementedException`, `throw new Error('not implemented')`). That test is
   **red by construction**: name it so in the report, with the missing symbol or the stub. For a
   form-designer state the red is obtained by construction,
   never by editing or reverting its form JSON.
3. **Code.** Write the smallest change that makes the test pass, citing the same `§REQ:<id>`.
4. **The battery — once, at the end of the implementation, in its declared scope.** While you
   implement, run no test: compile and type-check instead. When the whole implementation is
   written — every side of it, client and server — build every touched target and run its tests
   ONE time, in scope: by default the **impacted scope** — the tests added or changed PLUS those
   depending on the files you changed, which could have regressed (the runner's related/changed
   selection, or the import graph) — never the whole battery of the application, unless the run
   asks for it (`/req-loop --full`) or before a canary (the Director's chain). Quote the counts
   and name the scope; an impacted green never claims the tests outside it. When tests fail,
   revise the implementation and **re-run only the tests that failed**, until they are green: no
   confirmation pass over the whole scope follows.
   **End-to-end (Playwright) suites are the exception**: their battery is the change's scope — the
   specs new or modified in the change set plus those whose page, form JSON, page object or mock
   changed. The end-to-end tests of a form-designer state are written but not run by the
   developer: the user decides at the end of the run whether to run them. The rest of the e2e
   suite is never re-run to call the change done.
   **Red debt** — a test already red at HEAD is not yours. Read the red-debt ledger
   `.caep/req-loop/red-debt/<HEAD sha>.json` first. A red it does not hold is proven once, never
   again at the same HEAD: run the target in a clean checkout of HEAD (`git worktree add --detach`)
   and record what failed there, in the shape `/req-loop` documents.
5. **Stamps.** Close the requirement's metadata through the Gherkin tools, as the Gherkin
   contract prescribes — green only when step 4 leaves no red of your own: every red left is in the
   red-debt ledger of the current HEAD, or in a reading you took before your first edit. The report
   names each such red and where it was recorded.
6. **Changelog.** A change a user of the workspace can notice — a feature, a changed
   behaviour, a fix, a removal — is recorded in the SAME change set in the workspace's
   `CHANGELOG.md` ([Keep a Changelog](https://keepachangelog.com/): entries under
   `## [Unreleased]`, grouped as Added / Changed / Fixed / Removed), one entry per change,
   written for the person who uses the product and citing the `§REQ:<id>` it delivers. The
   README never grows a list of novelties: it links the changelog ONCE, in a "What's new"
   section — when either is missing, create it. Internal refactors, tests and tooling with no
   visible effect get no entry. A novelty known only to the commit log is a novelty nobody
   finds.
7. **Commit.** A green close is committed: exactly the files you wrote, as an explicit pathspec
   (never `-A` / `-a`), with a message citing the `§REQ:<id>` it delivers and the pre-commit hook
   running. A file that was dirty before you started is not yours and never enters your commit.
   When `.caep/req-loop/policy.json` says `"commit": "never"`, commit nothing and list your files
   in the report as one ready `git add -- …`.

## Regressions — the same cycle, again

A test that the final run turns red is a **regression** of the requirement that test
cites. It goes round the **same cycle**: re-read the requirement (did the change contradict
it, or is the requirement itself now wrong? — a requirement change is the user's decision),
fix the code, and re-run only the tests that failed. Repeat until they are green.

- **Never weaken, skip or delete a test** to make the battery green. Changing an assertion is
  legitimate only when the requirement it cites has changed — through the Gherkin tools, first.
- A red test that belongs to work **outside your task** (another session's uncommitted files,
  a pre-existing failure you can show exists without your change): **report it** by name with
  the evidence — do not change that work, and do not hide it inside "done".
- A test that fails only under load and passes alone is still reported, as flaky, with both
  runs quoted.

## Reporting

"Done" means: requirement written, model checked, test seen red (or red by construction) then green, battery green in its declared scope
with counts quoted, stamps closed, changelog entry written, committed. When any of these is missing, say which one — never
round a partial cycle up to done.
