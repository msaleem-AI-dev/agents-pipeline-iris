# Greenshades AI Agent Pipeline — Progress Tracker (AIDLC 10/10)
# Claude Code reads this at the start of every session.
# Update this file at the end of every session or agent group run.

---

## CURRENT STATE

**Last Updated:** —
**Active Pipeline:** None — fresh start
**Last Agent Run:** None
**Last Agent Output:** None
**Next Action:** Run /iris with real customer feedback to start the pipeline

---

## PIPELINE STATUS

| Group      | Sub-Agents | Status      | Output File                               | Date |
|------------|------------|-------------|-------------------------------------------|------|
| IRIS       | 6          | Not started | —                                         | —    |
| SAGE       | 7          | Not started | —                                         | —    |
| ATLAS      | 6          | Support     | — (invoked on-demand)                     | —    |
| FORGE      | 8          | Not started | —                                         | —    |
| QA         | 6          | Not started | —                                         | —    |
| SENTINEL   | 8          | Not started | —                                         | —    |
| CONDUCTOR  | 8          | Not started | —                                         | —    |
| GUARDIAN   | 8          | Not started | —                                         | —    |
| MLOPS      | 5          | Not started | — (activates for ML features only)        | —    |

**Status values:** Not started / Running / Gate / Complete / Blocked / Skipped (non-ML)

---

## GATE VERDICTS

| Agent Group | QA Verdict | SENTINEL Verdict | MLOPS Verdict |
|-------------|------------|------------------|---------------|
| —           | —          | —                | —             |

---

## ACTIVE FEATURES

None yet. Start with /iris.

---

## COMPLETED FEATURES

None yet.

---

## ACTIVE INCIDENTS

None.

---

## DECISIONS LOG

| Date | Agent Group | Sub-Agent | Decision | Reason |
|------|-------------|-----------|----------|--------|
| —    | —           | —         | —        | —      |

---

## BLOCKERS

None.

---

## MLOPS TRACK STATUS (for ML features)

| Model Name | Data Quality | Training | Eval | Deploy | Drift Status |
|------------|-------------|----------|------|--------|--------------|
| —          | —           | —        | —    | —      | —            |

---

## HOW TO USE THIS FILE

When an agent group completes, update the Pipeline Status table:
- Change status to: Running / Gate / Complete / Blocked
- Add the output filename (from specs/)
- Add today's date

When human approves a gate, update:
- Previous agent group → Complete
- Next agent group → Running

When MLOPS track is active:
- Update the MLOPS Track Status table separately
- MLOPS drift status = Monitoring after deploy (runs forever)

When session ends mid-pipeline:
- Note exactly which agent group was running and which sub-agent
- Note what the next action is
- Claude Code picks up from here next session

---

## QUICK REFERENCE — GATE COMMANDS

| You type        | What happens                                         |
|-----------------|------------------------------------------------------|
| next            | Approve gate, run next agent group                   |
| revise: [msg]   | Revise current output, stay at same gate             |
| stop            | Save state here, end session                         |
| loop: [agent]   | Loop back to a specific agent group (from GUARDIAN)  |
| approve         | Approve ATLAS output (changelog / runbook)           |

---

## QUICK REFERENCE — PIPELINE ORDER

```
1. /iris      Requirements Intelligence      (6 sub-agents)
2. /sage      Architecture & Design          (7 sub-agents)
      ↓  [ATLAS available at any point for context]
3. /forge     Code Generation                (8 sub-agents)
4. /qa        Quality Assurance              (6 sub-agents)  ← NEW
5. /sentinel  Security & Compliance          (8 sub-agents)
6. /conductor Deployment & Orchestration     (8 sub-agents)
7. /guardian  Monitoring & Incident Response (8 sub-agents)

Parallel:
/mlops        ML & Data Operations           (5 sub-agents)  ← NEW (ML features only)
/atlas        Knowledge & Context            (6 sub-agents)  ← support layer
```
