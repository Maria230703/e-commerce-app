#!/usr/bin/env node
// caip-mutation-red — the RED of code that already exists, shown in ONE call.
//
//   node .caep/scripts/caip-mutation-red.mjs <plan.json>
//
// Plan: { "cwd": "<dir, relative to where you run it>", "test": "<targeted test command>", "timeoutMs": 300000,
//         "mutations": [{ "id": "M1", "requirement": "<id>", "file": "<path from cwd>",
//                         "find": "<text that occurs exactly once>", "replace": "<the broken version>",
//                         "test": "<optional command for this mutation only>" }] }
//
// It proves the targeted tests green first (a red baseline mutates nothing), then for each mutation: writes it,
// runs the tests, puts the original bytes back and checks them, and prints one line — killed, survived, error or
// timeout — with the last lines of output as evidence. A journal under .caep/mutation-red holds the original of the
// file being mutated, so a runner killed mid-mutation is repaired the next time it starts.
//
// Exit: 0 every mutation killed · 1 any survived, errored or timed out · 2 red baseline · 3 invalid plan ·
//       4 a file could not be restored (the journal is kept) · 130 interrupted (the file was restored).
//
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXIT = { allKilled: 0, notAllKilled: 1, redBaseline: 2, badPlan: 3, restoreFailed: 4, interrupted: 130 };
const MAX_PER_REQUIREMENT = 6;
const DEFAULT_TIMEOUT_MS = 300_000;
const EVIDENCE_LINES = 6;
const JOURNAL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'mutation-red');
const JOURNAL = path.join(JOURNAL_DIR, 'journal.json');
const IS_WINDOWS = process.platform === 'win32';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const say = (line) => process.stdout.write(`${line}\n`);
const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

/** The mutation in flight: what to put back if the runner is interrupted. */
let active = null;

class RestoreError extends Error {}

// ── journal ─────────────────────────────────────────────────────────────────────────────────────────────────────

function writeJournal(entry) {
  fs.mkdirSync(JOURNAL_DIR, { recursive: true });
  const temporary = `${JOURNAL}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify({ version: 1, entries: [entry] }, null, 2));
  fs.renameSync(temporary, JOURNAL);
}

function clearJournal(entry) {
  fs.rmSync(JOURNAL, { force: true });
  if (entry) { fs.rmSync(entry.backup, { force: true }); }
}

/** Puts the original bytes back and checks them; the journal goes only once the file is proven whole. */
function restore(entry, original) {
  fs.writeFileSync(entry.file, original);
  if (sha256(fs.readFileSync(entry.file)) !== entry.sha256) {
    throw new RestoreError(`${entry.file}: the restored bytes do not match the original — the journal ${JOURNAL} is kept`);
  }
  clearJournal(entry);
}

/** A journal left by a runner that died mid-mutation: restore what it names before anything else runs. */
function recover(cwd) {
  if (!fs.existsSync(JOURNAL)) { return; }
  let journal;
  try {
    journal = JSON.parse(fs.readFileSync(JOURNAL, 'utf8'));
  } catch (error) {
    throw new RestoreError(`${JOURNAL} cannot be read (${error.message}); restore by hand, then delete it`);
  }
  for (const entry of journal.entries ?? []) {
    const shown = path.relative(cwd, entry.file) || entry.file;
    if (fs.existsSync(entry.file) && sha256(fs.readFileSync(entry.file)) === entry.sha256) {
      clearJournal(entry);
      continue;
    }
    if (!fs.existsSync(entry.backup)) {
      throw new RestoreError(`${entry.file} was left mutated and its backup ${entry.backup} is gone; restore it from git`);
    }
    const original = fs.readFileSync(entry.backup);
    if (sha256(original) !== entry.sha256) {
      throw new RestoreError(`${entry.backup} does not match the journal; restore ${entry.file} from git`);
    }
    restore(entry, original);
    say(`restored  ${shown} — left mutated by an interrupted run, original bytes put back`);
  }
  clearJournal();
}

// ── running a command ───────────────────────────────────────────────────────────────────────────────────────────

function killTree(child) {
  try {
    if (!IS_WINDOWS) { process.kill(-child.pid, 'SIGKILL'); return; }
  } catch { /* the group is gone, or never was — fall through */ }
  try { child.kill('SIGKILL'); } catch { /* already exited */ }
}

function run(command, cwd, timeoutMs) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, { cwd, shell: true, detached: !IS_WINDOWS, stdio: ['ignore', 'pipe', 'pipe'] });
    if (active) { active.child = child; }
    let output = '';
    const collect = (chunk) => {
      output += chunk;
      if (output.length > 64_000) { output = output.slice(-32_000); }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs);
    child.on('error', (error) => { output += `\n${error.message}`; });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (active) { active.child = undefined; }
      resolve({ code: code ?? (signal ? 128 : 1), timedOut, ms: Date.now() - started, output });
    });
  });
}

function evidence(output) {
  return output.split(/\r?\n/).map((line) => line.trimEnd()).filter(Boolean).slice(-EVIDENCE_LINES)
    .map((line) => `          | ${line.length > 200 ? `${line.slice(0, 200)}…` : line}`);
}

// ── the plan ────────────────────────────────────────────────────────────────────────────────────────────────────

function readPlan(file) {
  const problems = [];
  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { problems: [`${file}: ${error.message}`] };
  }
  if (typeof plan.test !== 'string' || !plan.test.trim()) { problems.push('"test" must be the targeted test command'); }
  if (!Array.isArray(plan.mutations) || plan.mutations.length === 0) { problems.push('"mutations" must list at least one mutation'); }
  const ids = new Set();
  const perRequirement = new Map();
  for (const [index, mutation] of (plan.mutations ?? []).entries()) {
    const where = `mutation ${index + 1}`;
    if (typeof mutation?.id !== 'string' || !mutation.id) { problems.push(`${where}: "id" is missing`); continue; }
    if (ids.has(mutation.id)) { problems.push(`${mutation.id}: the id is used twice`); }
    ids.add(mutation.id);
    if (typeof mutation.file !== 'string' || !mutation.file) { problems.push(`${mutation.id}: "file" is missing`); }
    if (typeof mutation.find !== 'string' || !mutation.find) { problems.push(`${mutation.id}: "find" is missing`); }
    if (typeof mutation.replace !== 'string') { problems.push(`${mutation.id}: "replace" is missing`); }
    if (mutation.find === mutation.replace) { problems.push(`${mutation.id}: "replace" is the same text as "find"`); }
    if (mutation.test !== undefined && (typeof mutation.test !== 'string' || !mutation.test.trim())) {
      problems.push(`${mutation.id}: "test", when given, must be a command`);
    }
    const requirement = mutation.requirement ?? '';
    perRequirement.set(requirement, (perRequirement.get(requirement) ?? 0) + 1);
  }
  for (const [requirement, count] of perRequirement) {
    if (count > MAX_PER_REQUIREMENT) {
      problems.push(`${requirement || 'the plan'} has ${count} mutations; at most ${MAX_PER_REQUIREMENT} per requirement — one per Then clause`);
    }
  }
  return { plan, problems };
}

function label(mutation) {
  return [mutation.id, mutation.requirement ? `§REQ:${mutation.requirement}` : '', mutation.file].filter(Boolean).join(' ');
}

// ── main ────────────────────────────────────────────────────────────────────────────────────────────────────────

async function main() {
  const planFile = process.argv[2];
  if (!planFile) {
    say('usage: node .caep/scripts/caip-mutation-red.mjs <plan.json>');
    return EXIT.badPlan;
  }
  const { plan, problems } = readPlan(path.resolve(planFile));
  if (problems.length) {
    for (const problem of problems) { say(`invalid   ${problem}`); }
    return EXIT.badPlan;
  }
  const cwd = path.resolve(plan.cwd ?? '.');
  const timeoutMs = Number.isFinite(plan.timeoutMs) && plan.timeoutMs > 0 ? plan.timeoutMs : DEFAULT_TIMEOUT_MS;
  say(`caip-mutation-red: ${plan.mutations.length} mutation(s) · cwd ${cwd} · timeout ${timeoutMs} ms`);

  recover(cwd);

  const tally = { killed: 0, survived: 0, error: 0, timeout: 0 };
  const results = [];
  const finish = (baseline) => {
    // The journal directory lives only while a mutation is in flight; an empty one is not left in the tree.
    try { fs.rmdirSync(JOURNAL_DIR); } catch { /* absent, or still holds what a failed restore kept */ }
    say(`RESULT ${JSON.stringify({ ...tally, baseline, mutations: results })}`);
  };

  // A kill means something only against a green baseline: every distinct command, unmutated, first.
  const commands = [...new Set([plan.test, ...plan.mutations.map((m) => m.test).filter(Boolean)])];
  for (const command of commands) {
    const baseline = await run(command, cwd, timeoutMs);
    if (baseline.code !== 0 || baseline.timedOut) {
      say(`baseline  red · ${command} — ${baseline.timedOut ? `no verdict within ${timeoutMs} ms` : `exit ${baseline.code}`}; no mutation applied`);
      for (const line of evidence(baseline.output)) { say(line); }
      finish('red');
      return EXIT.redBaseline;
    }
    say(`baseline  green · ${command} (${seconds(baseline.ms)})`);
  }

  for (const mutation of plan.mutations) {
    const file = path.resolve(cwd, mutation.file);
    const record = { id: mutation.id, requirement: mutation.requirement ?? null, file: mutation.file };
    if (!fs.existsSync(file)) {
      tally.error++;
      results.push({ ...record, outcome: 'error', reason: 'no such file' });
      say(`error     ${label(mutation)} — no such file`);
      continue;
    }
    const original = fs.readFileSync(file);
    const text = original.toString('utf8');
    const occurrences = text.split(mutation.find).length - 1;
    if (occurrences !== 1) {
      tally.error++;
      results.push({ ...record, outcome: 'error', reason: `the search text occurs ${occurrences} times` });
      say(`error     ${label(mutation)} — the search text occurs ${occurrences} times; it must occur exactly once`);
      continue;
    }

    const entry = { file, backup: path.join(JOURNAL_DIR, `${sha256(Buffer.from(file))}.orig`), sha256: sha256(original) };
    fs.mkdirSync(JOURNAL_DIR, { recursive: true });
    fs.writeFileSync(entry.backup, original);
    writeJournal(entry);
    active = { entry, original };
    let outcome;
    try {
      fs.writeFileSync(file, text.replace(mutation.find, () => mutation.replace));
      outcome = await run(mutation.test ?? plan.test, cwd, timeoutMs);
    } finally {
      restore(entry, original);
      active = null;
    }

    if (outcome.timedOut) {
      tally.timeout++;
      results.push({ ...record, outcome: 'timeout', ms: outcome.ms });
      say(`timeout   ${label(mutation)} — no verdict within ${timeoutMs} ms; a hang is not a kill`);
    } else if (outcome.code === 0) {
      tally.survived++;
      results.push({ ...record, outcome: 'survived', ms: outcome.ms });
      say(`survived  ${label(mutation)} — the tests still pass (${seconds(outcome.ms)}): strengthen the test`);
    } else {
      tally.killed++;
      results.push({ ...record, outcome: 'killed', exitCode: outcome.code, ms: outcome.ms });
      say(`killed    ${label(mutation)} — exit ${outcome.code} in ${seconds(outcome.ms)}`);
      for (const line of evidence(outcome.output)) { say(line); }
    }
  }

  finish('green');
  return tally.killed === plan.mutations.length ? EXIT.allKilled : EXIT.notAllKilled;
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    if (active) {
      if (active.child) { killTree(active.child); }
      try {
        restore(active.entry, active.original);
        say(`interrupted by ${signal} — ${active.entry.file} restored`);
      } catch (error) {
        say(`interrupted by ${signal} — ${error.message}`);
        process.exit(EXIT.restoreFailed);
      }
    }
    process.exit(EXIT.interrupted);
  });
}

main().then(
  (code) => { process.exitCode = code; },
  (error) => {
    say(`fatal     ${error.message}`);
    process.exitCode = error instanceof RestoreError ? EXIT.restoreFailed : EXIT.badPlan;
  },
);
