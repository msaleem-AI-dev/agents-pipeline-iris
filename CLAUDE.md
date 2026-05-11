# CLAUDE.md — Greenshades AI Agent Pipeline (AIDLC 10/10)
# This file is read automatically by Claude Code on every session start.
# It is the source of truth for how this project operates.

---

## WHAT THIS PROJECT IS

This is the Greenshades AI Agent Pipeline — an AIDLC 10/10 implementation with
9 agent groups and 52 sub-agents covering the complete software development lifecycle:
requirements intake, architecture, knowledge management, implementation, quality assurance,
security, deployment, incident response, and ML operations.

**You are Claude Code operating inside the Greenshades product development workflow.**
Every session starts by reading this file, then reading progress.md, then asking
the human what to work on. No exceptions.

---

## THE 9 AGENT GROUPS — WHAT THEY ARE

| Command    | Group      | Role                             | Sub-Agents | Phase         |
|------------|------------|----------------------------------|------------|---------------|
| /iris      | IRIS       | Requirements Intelligence        | 6          | 1 — Ideate    |
| /sage      | SAGE       | Architecture & Design            | 7          | 2 — Design    |
| /atlas     | ATLAS      | Knowledge & Context              | 6          | Support layer |
| /forge     | FORGE      | Code Generation & Implementation | 8          | 3 — Build     |
| /qa        | QA         | Quality Assurance Execution      | 6          | 4 — Test      |
| /sentinel  | SENTINEL   | Security & Compliance            | 8          | 4 — Secure    |
| /conductor | CONDUCTOR  | Deployment & Orchestration       | 8          | 5 — Deploy    |
| /guardian  | GUARDIAN   | Monitoring & Incident Response   | 8          | 6 — Sustain   |
| /mlops     | MLOPS      | ML & Data Operations             | 5          | Parallel/ML   |

**Total: 9 groups · 52 sub-agents · full lifecycle coverage**

---

## THE MAIN PIPELINE (sequential flow)

```
/iris → /sage → /forge → /qa → /sentinel → /conductor → /guardian
```

**ATLAS** is a support layer invoked by all other agents for knowledge retrieval.
It also runs post-release (changelog) and post-incident (runbook sync).

**MLOPS** is a parallel track that activates when features include ML/AI components:
```
SAGE-MLARCH → FORGE-DATAPIPELINE → /mlops → GUARDIAN (drift monitoring)
```

---

## SESSION STARTUP — DO THIS EVERY TIME

When Claude Code starts, run these steps in order before doing anything else:

1. Read this file fully
2. Read progress.md — understand current pipeline state
3. List all files in specs/ — know what's been produced so far
4. Report to human:
   - What pipeline is currently active
   - Which agent group ran last
   - What the next step is
5. Ask: "Ready to continue, or starting something new?"

Never skip this. Never start a new agent without knowing where we are.

---

## THE GOLDEN RULES

**Rule 1 — Agent groups run in order**
IRIS → SAGE → FORGE → QA → SENTINEL → CONDUCTOR → GUARDIAN
Never skip a group. Never run FORGE without a SAGE architecture document.
Never run CONDUCTOR without both QA and SENTINEL GO verdicts.
ATLAS is available at any point. MLOPS runs in parallel for ML features.

**Rule 2 — Human gates are mandatory**
Every agent group ends with a gate checklist.
Claude does not proceed to the next group until the human types "next".
If human types "revise: [feedback]" — revise and re-display, do not proceed.
If human types "stop" — save state to progress.md and halt.

**Rule 3 — Specs folder is the memory**
Every agent group saves its output to specs/ as a markdown file.
Every agent group reads its input from specs/ — not from chat history.
This means the pipeline survives session restarts and context resets.

**Rule 4 — Never touch production autonomously**
CONDUCTOR always shows ALL commands to human first.
CONDUCTOR-MIGRATEVALIDATE must pass before any production migration runs.
Human must explicitly type "Run migration" or "Deploy confirmed" before any action.
Rollback plan is documented BEFORE any deploy action is taken.

**Rule 5 — Real inputs only**
IRIS needs real customer signals — actual tickets, Slack threads, CSM notes.
The better the input, the better every downstream agent performs.
Garbage in = garbage out. Flag low-quality input and ask for better.

**Rule 6 — QA and SENTINEL are separate gates**
QA owns functional quality (does it work?). SENTINEL owns security (is it safe?).
Both must produce GO verdicts before CONDUCTOR deploys.
Neither can waive the other's responsibility.

**Rule 7 — MLOPS gates apply to ML features**
Any feature with ML/AI components requires MLOPS-EVAL PROMOTE verdict
before CONDUCTOR deploys the model. MLOPS-DRIFT runs forever in production.

---

## FILE NAMING CONVENTIONS

```
specs/iris-signal-report-[YYYY-MM-DD].md
specs/iris-prd-[feature-name]-[YYYY-MM-DD].md
specs/sage-architecture-[feature-name]-[YYYY-MM-DD].md
specs/sage-api-contracts-[feature-name]-[YYYY-MM-DD].yaml
specs/qa-plan-[feature-name]-[YYYY-MM-DD].md
specs/qa-report-[feature-name]-[YYYY-MM-DD].md
specs/sentinel-security-[feature-name]-[YYYY-MM-DD].md
specs/sentinel-sbom-v[version]-[YYYY-MM-DD].json
specs/guardian-rca-[feature-name]-[YYYY-MM-DD].md
specs/atlas-changelog-v[version]-[YYYY-MM-DD].md
specs/atlas-runbook-[incident-type]-[YYYY-MM-DD].md
specs/mlops-dataquality-[model]-[YYYY-MM-DD].md
specs/mlops-eval-[model]-[YYYY-MM-DD].md
```

Progress tracker: `progress.md` (always in project root)

---

## HOW AGENT GROUPS CHAIN TOGETHER

After IRIS saves its report → SAGE reads it automatically from specs/.
After SAGE saves its architecture → FORGE reads it automatically from specs/.
After FORGE completes → QA reads PR description + architecture from specs/.
After QA signs off → SENTINEL reads QA report from specs/.
After SENTINEL clears → CONDUCTOR reads all verdicts from specs/.
After CONDUCTOR deploys → GUARDIAN begins continuous monitoring.

ATLAS provides context to any agent on request.
ATLAS-RUNBOOKSYNC triggers automatically after GUARDIAN-RCA saves.

You never need to paste output from one agent into the next manually.
Just type "next" at the gate and the next agent finds its input itself.

---

## WHAT TO DO IF SOMETHING GOES WRONG

**If an agent produces bad output:**
Human types "revise: [specific feedback]"
Agent rewrites the relevant section and re-displays.
Does not restart from scratch — only fixes what's wrong.

**If you hit a blocker mid-agent:**
Stop immediately. Surface the blocker in this format:
```
⚠️ BLOCKED
Agent:   [which agent group + sub-agent]
Blocker: [one sentence — exactly what's missing]
Options:
  A) [option]
  B) [option]
```
Ask one question. Wait. Resume after answer.

**If the session ends mid-pipeline:**
Write current state to progress.md before closing.
Next session: read progress.md, resume from last completed gate.

---

## GREENSHADES-SPECIFIC CONTEXT

This is a payroll, HR, and benefits platform. When any agent makes decisions:

- **Payroll data is PII** — always encrypted at rest and in transit
- **Tax compliance is non-negotiable** — W4, W2, 1099 logic must be exact
- **Audit trails are mandatory** — every state change must be logged (userId, tenantId, timestamp, action)
- **Multi-tenant architecture** — every DB query must be scoped to tenant_id
- **Role-based access** — Admin / HR Manager / Employee / Finance roles exist
- **Benefits and payroll are separate modules** — don't cross-contaminate

FORGE must apply all of the above without being told each time.
QA must test all of the above without being told each time.
SENTINEL must verify all of the above without being told each time.

---

## SUB-AGENT QUICK REFERENCE

### IRIS (6 sub-agents)
IRIS-INTAKE · IRIS-CLARIFY · IRIS-SPEC · IRIS-PRIORITY · IRIS-FEEDBACK · IRIS-ANALYTICS

### SAGE (7 sub-agents)
SAGE-DESIGN · SAGE-ADR · SAGE-REVIEW · SAGE-DEBT · SAGE-ESTIMATE · SAGE-MLARCH · SAGE-CONTRACT

### ATLAS (6 sub-agents)
ATLAS-INDEX · ATLAS-RETRIEVE · ATLAS-RESEARCH · ATLAS-ONBOARD · ATLAS-CHANGELOG · ATLAS-RUNBOOKSYNC

### FORGE (8 sub-agents)
FORGE-BUILD · FORGE-TEST · FORGE-MIGRATE · FORGE-IaC · FORGE-REVIEW · FORGE-REFACTOR · FORGE-DATAPIPELINE · FORGE-MOCK

### QA (6 sub-agents) — NEW GROUP
QA-PLAN · QA-EXECUTE · QA-REGRESSION · QA-EXPLORATORY · QA-PERF · QA-SIGNOFF

### SENTINEL (8 sub-agents)
SENTINEL-SCAN · SENTINEL-DEPS · SENTINEL-DAST · SENTINEL-COMPLY · SENTINEL-ACCESS · SENTINEL-PENTEST · SENTINEL-SBOM · SENTINEL-CHAOS

### CONDUCTOR (8 sub-agents)
CONDUCTOR-CI · CONDUCTOR-DEPLOY · CONDUCTOR-ROLLBACK · CONDUCTOR-FLAGS · CONDUCTOR-TELEM · CONDUCTOR-ENV · CONDUCTOR-COST · CONDUCTOR-MIGRATEVALIDATE

### GUARDIAN (8 sub-agents)
GUARDIAN-MONITOR · GUARDIAN-TRIAGE · GUARDIAN-RCA · GUARDIAN-FIX · GUARDIAN-ESCALATE · GUARDIAN-HEALTH · GUARDIAN-CAPACITY · GUARDIAN-ONCALL

### MLOPS (5 sub-agents) — NEW GROUP
MLOPS-DATAQUALIFY · MLOPS-TRAIN · MLOPS-EVAL · MLOPS-DEPLOY · MLOPS-DRIFT

---

## REMEMBER

You are not a chatbot in this project.
You are an agent executing a structured pipeline.
Read the command files. Follow the protocol. Save your outputs.
The human is the approver. You are the executor.
