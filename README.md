# create-iris-pipeline

> Scaffold the **AIDLC 10/10** AI development pipeline into any Claude Code project — instantly.
> 9 agent groups · 52 sub-agents · full lifecycle coverage.

```bash
npx create-iris-pipeline
```

---

## What It Does

Running the command above drops the full pipeline into your project:

```
your-project/
├── CLAUDE.md                        ← Pipeline constitution (auto-read by Claude Code)
├── progress.md                      ← Session-persistent state tracker
├── specs/                           ← All agent outputs land here
└── .claude/
    └── commands/
        ├── iris.md                  ← /iris      — Requirements Intelligence
        ├── sage.md                  ← /sage      — Architecture & Design
        ├── atlas.md                 ← /atlas     — Knowledge & Context
        ├── forge.md                 ← /forge     — Code Generation & Implementation
        ├── qa.md                    ← /qa        — Quality Assurance Execution
        ├── sentinel.md              ← /sentinel  — Security & Compliance
        ├── conductor.md             ← /conductor — Deployment & Orchestration
        ├── guardian.md              ← /guardian  — Monitoring & Incident Response
        └── mlops.md                 ← /mlops     — ML & Data Operations
```

---

## The 9 Agent Groups · 52 Sub-Agents

| Command | Group | Sub-Agents | Sub-Agent Names | Phase |
|---|---|---|---|---|
| `/iris` | IRIS | 6 | INTAKE · CLARIFY · SPEC · PRIORITY · FEEDBACK · ANALYTICS | 1 — Ideate |
| `/sage` | SAGE | 7 | DESIGN · ADR · REVIEW · DEBT · ESTIMATE · MLARCH · CONTRACT | 2 — Design |
| `/atlas` | ATLAS | 6 | INDEX · RETRIEVE · RESEARCH · ONBOARD · CHANGELOG · RUNBOOKSYNC | Support |
| `/forge` | FORGE | 8 | BUILD · TEST · MIGRATE · IaC · REVIEW · REFACTOR · DATAPIPELINE · MOCK | 3 — Build |
| `/qa` | QA | 6 | PLAN · EXECUTE · REGRESSION · EXPLORATORY · PERF · SIGNOFF | 4 — Test |
| `/sentinel` | SENTINEL | 8 | SCAN · DEPS · DAST · COMPLY · ACCESS · PENTEST · SBOM · CHAOS | 4 — Secure |
| `/conductor` | CONDUCTOR | 8 | CI · DEPLOY · ROLLBACK · FLAGS · TELEM · ENV · COST · MIGRATEVALIDATE | 5 — Deploy |
| `/guardian` | GUARDIAN | 8 | MONITOR · TRIAGE · RCA · FIX · ESCALATE · HEALTH · CAPACITY · ONCALL | 6 — Sustain |
| `/mlops` | MLOPS | 5 | DATAQUALIFY · TRAIN · EVAL · DEPLOY · DRIFT | Parallel/ML |

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

From there, just type `next` at each human gate to advance the pipeline.

---

## Pipeline Flow

```
/iris → /sage → /forge → /qa → /sentinel → /conductor → /guardian

Parallel tracks:
  /atlas  — knowledge & context support layer (available at any stage)
  /mlops  — ML lifecycle track (activates for AI/ML features)
```

Each agent saves its output to `specs/` and the next agent reads from there automatically.
You never need to paste output from one agent to the next — just type `next`.

---

## Human Gates

Every agent group ends with a checklist. Claude does **not** advance until you approve.

| You type | What happens |
|---|---|
| `next` | Approve gate, run next agent group |
| `revise: [msg]` | Revise current output, stay at same gate |
| `stop` | Save state to progress.md, end session |

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
