---
applyTo: "**"
---
# CAIP Modeler protocol — universal mode (binding)

The C4 model is authoritative ONLY through the `caipC4Modeler*` MCP tools. Never edit the
model's YAML files directly, and never conclude anything about the model from grepping them.

## Writing

1. **Read before writing.** Resolve the nodes you are about to touch
   (`caipC4ModelerGetNodesInfo`) and quote the relevant "before" when reporting a change.
2. **Address by ID, never by name.** Names collide and drift; every reference a tool asks for
   is a node ID. When a validator or option list rejects a by-name value, the proven repair is
   the node ID after a fresh read.
3. **Batch related changes** in one `caipC4ModelerUpdateNodes` / `caipC4ModelerCreateEdges`
   call where possible — then **re-read validation**: a result carrying "write introduced N
   validation errors" is YOUR red; repair it before moving on.
4. **One bounded retry** on a transient `Node with id … not found` for a node created
   moments ago: first re-read the node and affected state. Retry only when the node now
   resolves and the requested mutation was not applied. A second failure is real.
5. **Bracket every batch with the layout.** A batch is any run of writes on one or more
   diagrams; a single read is not a batch. BEFORE the first write, run
   `caipC4ModelerAutoLayout` on each diagram you are about to change — a diagram that is
   already badly laid out gets cleaned up by ordinary work. AFTER the last write, run
   `caipC4ModelerAutoLayout` again on every diagram you changed (it arranges the diagram
   currently shown: navigate to each one first), then **save** (`caipC4ModelerSave`) once the
   change set is complete. Unsaved writes are a dirty tree; a timeout is NOT a verdict —
   re-read before retrying a mutation.
6. **Add-and-rewire, never demolition.** Rerouting an interaction is rewiring; deleting a NODE
   is not yours to do to satisfy a reference — park the issue and report it
   (park-don't-invent: never create artifacts just to make a reference resolve). **Orphaning
   counts as demolition**: dropping a node from its parent's `children` loses it to the
   architecture even though the file survives. Before creating, check whether a node for the
   same concept already exists (orphaned included): reattach and retype beats
   duplicate-and-abandon. A node under the wrong family is retyped IN PLACE with
   `caipC4ModelerRetypeNodes` (id, name, children, interactions, anchors and position survive;
   pass the properties the new family requires) — never recreated and deleted. An ORPHAN — a
   `model.orphan-file` issue: the file exists, no parent lists it — is repaired with
   `caipC4ModelerReattachNodes({ attachments: [{ nodeId, parentId }] })`, which resolves the node
   anywhere in the project and keeps its id; the issue names the suggested parent. The same tool
   MOVES a node under another parent. An orphan is never recreated with
   `caipC4ModelerCreateNodes`: that mints a new id and breaks every `@c4-id:` anchor. Use
   `dryRun: true` to see the verdict per entry before writing.
7. **Prefer the specific family over the abstract one.** A mobile client is a
   `mobile-application`, a web/SPA client a `web-application`, a database a `database`, an
   API gateway a `gateway`, a broker a `message-bus`. The abstract types are the guaranteed
   fallback for concepts with no matching family — never the default: the type IS
   architecture information.
8. **One container per deployable unit.** A mobile app and a web app are TWO containers even
   when one codebase produces both — the shared codebase is a build-time fact (descriptions,
   shared target-profile cwd), never topology. Distinct clients are never per-target
   components inside one "client" container: components are internals of ONE runtime.
9. **Decompose from the start.** When you create a container, create its components in the same
   change set — one component per cohesive responsibility of the runtime — and give every
   component with real logic its Code level (L4): the classes/modules the implementation will
   have. A container without components (`container-without-components`) or a component with
   logic but no Code level (`component-without-code`) is incomplete architecture, and the
   validator warns about it. Requirements anchor at the level they describe: a feature that
   outgrows 15 scenarios is split onto the components that own its sub-capabilities.

## The system boundary — decide it before the first node

10. **One software system per product.** A software system is a boundary of product and
    ownership: the user's own system, or an EXTERNAL one (a broker, a payment provider, a
    third-party API). A deployable application of that product is ALWAYS a container, never a
    software system. "A system with N applications" is ONE internal software system at the
    context level with N child containers; each application's components sit under its own
    container. Before creating a node at the context level ask: is this a distinct system,
    or an application of the system I am describing?
11. **State the hierarchy before the first write.** In a few lines, write the hierarchy you
    are about to create (context → container → component) and check it against the user's
    words. When the system boundary is ambiguous (two products, or one product with several
    apps?), ask ONE question with a `caip-ask` card instead of guessing.
12. **Know the validator's limit before you model.** `max-one-internal-software-system`
    flags a second internal system in the context: if the user's words really describe two
    products, say so and let them decide. A system may hold as many web applications as it
    has. Never save validation errors your own write introduced without
    saying so: "write introduced N validation errors" is yours to repair or to report.
13. **Repair, never demolish.** A wrong hierarchy (applications drawn as systems) is
    repaired with `caipC4ModelerReattachNodes`: move each container under the one system,
    keeping its id — and with it every `@c4-id:` anchor of the requirements. `dryRun: true`
    first, then the write, then re-read the validation. After the move, recreate the
    context-level interactions (person → system, system → external system) and reconnect the
    containers' own. A software system left empty is deleted only on the user's explicit OK.
14. **Close with the count.** After any change at the context level, read
    `caipC4ModelerGetActiveLevelDiagram` there and report how many internal software systems
    it shows, beside the people and external systems. For one product the answer is one.
    The validator's `internal-systems-over-split` warning marks the usual mistake: several
    internal systems with one container each, sharing the same people or external systems.

Wrong — three systems for three applications:

```text
Context:  DigitalTwin (software system) ─ Jetpac (software system) ─ Karts (software system)
            └ DigitalTwin Web            └ Jetpac Web             └ Karts Web
```

Right — one system, three containers:

```text
Context:  <Product> (software system) ← people, → external systems
Container:  DigitalTwin Web · Jetpac Web · Karts Web   (each a container of <Product>)
Component:  each application's components under its own container
```

## Universal mode specifics

- Closed option-lists are advisory here (`prop.invalid-option` surfaces as a warning): prefer
  the listed values, never fight a model over one, and never "fix" a warning by inventing
  artifacts.
- The mode itself lives at level 0 of the model (`mode:` in `index.yml`, beside
  `caepVersion`) — never move it into editor settings.
- The whole zoom chain is navigable with the abstract vocabulary (abstract container →
  abstract component → code level, self-nesting); the full palette stays available as
  modeling intent — richness is not CAIP-ness.
