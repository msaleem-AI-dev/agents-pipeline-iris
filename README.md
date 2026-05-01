# create-iris-pipeline

> Scaffold the 7-agent AI development pipeline into any Claude Code project — instantly.

```bash
npx create-iris-pipeline
```

---

## What It Does

Running the command above drops the full **IRIS → SAGE → ATLAS → FORGE → SENTINEL → CONDUCTOR → GUARDIAN** pipeline into your project:

```
your-project/
├── CLAUDE.md                        ← Pipeline constitution (auto-read by Claude Code)
├── progress.md                      ← Session-persistent state tracker
├── specs/                           ← All agent outputs land here
└── .claude/
    └── commands/
        ├── iris.md                  ← /iris  — Intelligent Requirements Ingest System
        ├── sage.md                  ← /sage  — Synthesis & Analysis Generation Engine
        ├── atlas.md                 ← /atlas — Architecture & Technical Layering System
        ├── forge.md                 ← /forge — Feature Output & Requirements Generation Engine
        ├── sentinel.md              ← /sentinel — System & Evaluation Network
        ├── conductor.md             ← /conductor — Continuous Operations & Deployment
        └── guardian.md              ← /guardian — Governance, Uptime & Audit
```

---

## The 7 Agents

| Command       | Agent      | Phase       | What It Produces                 |
|---------------|------------|-------------|----------------------------------|
| `/iris`       | IRIS       | 1 — Ideate  | Clustered Signal Report          |
| `/sage`       | SAGE       | 1 — Ideate  | Draft PRD + User Stories         |
| `/atlas`      | ATLAS      | 2 — Design  | Technical Design Document        |
| `/forge`      | FORGE      | 3 — Build   | Pull Requests + Test Suite       |
| `/sentinel`   | SENTINEL   | 4 — Test    | Test Report + Defect Log         |
| `/conductor`  | CONDUCTOR  | 5 — Deploy  | Live Release + Telemetry         |
| `/guardian`   | GUARDIAN   | 6 — Sustain | Fix PRs + RCA + Tech Debt        |

---

## Quick Start

```bash
# 1. Scaffold into your project
cd your-project
npx create-iris-pipeline

# 2. Open Claude Code
# Claude automatically reads CLAUDE.md at session start

# 3. Feed it real customer signals and kick off the pipeline
/iris <paste your tickets, Slack threads, CSM notes, NPS comments>
```

From there, just type `next` at each human gate to advance the pipeline agent by agent.

---

## How Agents Chain

Each agent saves its output to `specs/` and the next agent reads from there automatically.  
You never need to paste output from one agent into the next — just type `next`.

```
/iris  →  specs/iris-signal-report-YYYY-MM-DD.md
/sage  →  specs/sage-prd-[feature]-YYYY-MM-DD.md
/atlas →  specs/atlas-tdd-[feature]-YYYY-MM-DD.md
...
```

---

## Human Gates

Every agent ends with a checklist. Claude does **not** advance until you approve.

| You type          | What happens                                |
|-------------------|---------------------------------------------|
| `next`            | Approve gate, run next agent                |
| `revise: [msg]`   | Revise current output, stay at same gate    |
| `stop`            | Save state to progress.md, end session      |

---

## Requirements

- [Claude Code](https://claude.ai/code) (the CLI, not claude.ai web)
- Node.js ≥ 16.7
- No other dependencies

---

## Safe to Re-run

Already have some files? No problem. `create-iris-pipeline` **skips existing files** and never overwrites anything.

---

## License

MIT
