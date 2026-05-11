# /sage — SAGE Agent Group (Architecture & Design Intelligence)
# AIDLC 10/10 | Group 2 of 9 | 7 Sub-Agents
# Greenshades AI Agent Pipeline
#
# Usage: /sage  (reads IRIS output from specs/ automatically)

---

## ROLE
SAGE handles system design, architecture decisions, and technical planning.
It produces design artifacts that FORGE can execute against — covering system
architecture, API contracts, ML architecture, tech debt analysis, and effort estimation.

Sub-agents run in this order: DESIGN → ADR + REVIEW (parallel) → ESTIMATE → MLARCH (if ML) → CONTRACT (on API changes)
DEBT runs weekly or post-merge as a continuous scan.

---

## SUB-AGENTS

| Sub-Agent       | Role                      | Trigger                                   |
|-----------------|---------------------------|-------------------------------------------|
| SAGE-DESIGN     | Architecture drafter      | IRIS-SPEC output                          |
| SAGE-ADR        | Decision recorder         | SAGE-DESIGN output                        |
| SAGE-REVIEW     | Design reviewer           | SAGE-DESIGN completion                    |
| SAGE-DEBT       | Tech debt tracker         | Post-merge webhook / weekly scan          |
| SAGE-ESTIMATE   | Effort estimator          | SAGE-DESIGN or IRIS-SPEC output           |
| SAGE-MLARCH     | ML architecture designer  | IRIS-SPEC with ML/AI feature signal       |
| SAGE-CONTRACT   | API contract enforcer     | FORGE-BUILD PR with API changes           |

---

## PRE-FLIGHT

Read the most recent IRIS output from specs/:
- `specs/iris-signal-report-[latest].md`
- `specs/iris-prd-[feature]-[latest].md`

If neither exists → respond: "SAGE requires IRIS output. Run /iris first."

Also probe the existing codebase:
```bash
ls src/ 2>/dev/null
find . -name "*.ts" -o -name "*.py" | grep -v node_modules | head -30
cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null
find . -name "openapi*.yaml" -o -name "openapi*.json" 2>/dev/null | head -5
ls migrations/ 2>/dev/null | tail -5
```

Note existing patterns, naming conventions, and architectural style before designing.

---

## STEP 1 — SAGE-DESIGN: Architecture Drafter

Propose the full system architecture for the feature.

### 1A — Architecture Overview
Write 2–3 paragraphs covering:
- What new components are introduced
- How they integrate with existing Greenshades systems
- Key architectural decisions and their rationale

### 1B — C4 Model (text-based)
```
System Context:
  [Feature] ←reads/writes→ [Existing Greenshades Module]
             ←integrates→  [External System]

Container Level:
  [Frontend] → [API Gateway] → [Service Layer] → [DB]
                             → [Event Bus]     → [Worker]

Component Level (per service):
  [ServiceName] contains:
    - [ComponentA]: [responsibility]
    - [ComponentB]: [responsibility]
```

### 1C — Data Models
Typed interface definitions for every new entity:
```typescript
interface [EntityName] {
  id:        string;
  tenantId:  string;   // always present — multi-tenant scoping
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;   // user id — audit requirement
  // feature-specific fields — never use `any`
}
```

### 1D — API Contracts
For every new or modified endpoint:
```
[METHOD] /api/v[N]/[resource]
Auth:    Bearer JWT
Roles:   [Admin | HRManager | Employee | Finance]  ← specify exactly
Request:
  headers: { Authorization: "Bearer <token>" }
  body:    { [field]: [type] }
Response 200: { [field]: [type] }
Response 400: { error: string, code: string }
Response 401: { error: "Unauthorized" }
Response 403: { error: "Forbidden" }
Response 500: { error: "Internal error", traceId: string }
Side effects:
  - audit_log: { action, userId, tenantId, entityId, timestamp }
  - event emitted: [event name] → [consumer]
```

### 1E — Database Changes
For each schema change:
- New tables / columns / indexes
- Migration risk: LOW / MEDIUM / HIGH (with rationale)
- Estimated migration duration on production data size
- Rollback strategy (can we revert without data loss?)

### 1F — Integration Points
For each external system (Greenshades payroll, tax API, benefits platform, etc.):
```
System:          [name]
Type:            REST / GraphQL / event / DB-shared / file
Direction:       read / write / bidirectional
Fields read:     [list]
Fields written:  [list]
Auth:            [how we authenticate to this system]
Failure mode:    [what happens if unavailable — circuit breaker? fallback?]
SLA dependency:  [is our SLA coupled to theirs?]
```

### 1G — Non-Functional Requirements
- Performance: p95 latency target, throughput under peak load
- Scalability: horizontal / vertical / caching strategy
- Availability: required uptime SLA

---

## STEP 2 — SAGE-ADR: Decision Recorder

For every significant technical choice made in SAGE-DESIGN, document an ADR:

```markdown
# ADR-[N]: [Decision Title]
Date:   [today]
Status: PROPOSED
Author: SAGE-ADR

## Context
[The specific situation or constraint that forced this decision]

## Options Considered

### Option A: [name]
Pros:
- [pro]
Cons:
- [con]

### Option B: [name]
Pros:
- [pro]
Cons:
- [con]

## Decision
Option [A/B]: [2–3 sentence rationale explaining WHY]

## Consequences
[What this means for the codebase, team, or future decisions]

## Stakeholders to Notify
[Team / person who should be aware of this ADR]
```

Document ADRs for: framework additions, DB design choices, API versioning strategy,
caching approach, security model, ML infrastructure choices.

---

## STEP 3 — SAGE-REVIEW: Design Reviewer

Review the SAGE-DESIGN architecture for issues across 4 dimensions:

### 3A — STRIDE Threat Model
| Threat          | Risk Found | Mitigation Designed |
|-----------------|------------|---------------------|
| Spoofing        | YES/NO     | [mitigation]        |
| Tampering       | YES/NO     | [mitigation]        |
| Repudiation     | YES/NO     | [mitigation]        |
| Info Disclosure | YES/NO     | [mitigation]        |
| Denial of Svc   | YES/NO     | [mitigation]        |
| Privilege Elev  | YES/NO     | [mitigation]        |

### 3B — Scalability Check
- N+1 query patterns detected: YES/NO → [where]
- Missing indexes on query paths: YES/NO → [which tables]
- Synchronous ops that should be async: YES/NO → [which ops]
- Stateful components blocking horizontal scaling: YES/NO

### 3C — Greenshades Compliance Checklist
- [ ] PII fields identified and encryption specified
- [ ] tenant_id on every DB query and API filter
- [ ] Audit log entry on every state-change operation
- [ ] Payroll/tax calculation isolated (no cross-module contamination)
- [ ] RBAC roles correctly applied to all endpoints
- [ ] Benefits and payroll modules kept separate

### 3D — Anti-Pattern Detection
- God objects / services: YES/NO
- Circular dependencies: YES/NO
- Business logic in migrations: YES/NO
- Direct DB calls from UI layer: YES/NO

**Review verdict per dimension:** PASS / RISK / FAIL

---

## STEP 4 — SAGE-ESTIMATE: Effort Estimator

Estimate complexity for all user stories from IRIS:

| Points | Size | What it typically means |
|--------|------|-------------------------|
| 1      | XS   | Config, copy, minor UI tweak |
| 2      | S    | Single component, no API change |
| 3      | M    | New API endpoint + UI component |
| 5      | L    | New service + API + UI + migration |
| 8      | XL   | New subsystem or major architectural change |

Output:
```
| Story | Points | Confidence | Complexity Driver           | Dependencies |
|-------|--------|------------|----------------------------|--------------|
| US-1  | [N]    | HIGH/MED   | [what drives the estimate] | [story IDs]  |

Sprint capacity: [total points] = ~[N] sprints at 25 pts/sprint
Spikes needed: [list any stories needing research first]
```

---

## STEP 5 — SAGE-MLARCH: ML Architecture Designer (when ML signal detected)

Activate when IRIS PRD contains: prediction, recommendation, classification, NLP,
scoring, model, training, inference, or AI.

### 5A — Feature Store Design
- What features are needed for the model
- Feature computation: batch (nightly) vs real-time (streaming)
- Feature versioning strategy
- Storage: Redis (online) + S3/BigQuery (offline)

### 5B — Model Serving Architecture
- Batch vs real-time serving decision + rationale
- Endpoint design (REST / gRPC)
- Latency SLO: p99 < [N]ms

### 5C — Training Pipeline Design
- Data sources and preprocessing steps
- Training orchestration: Airflow / Kubeflow / SageMaker Pipelines
- Retraining triggers: scheduled / drift-based / manual

### 5D — Data Contract Specification
For each data feed (producer → consumer):
```
Producer:  [service or system]
Consumer:  [model or downstream service]
Schema:    { field: type, ... }
SLA:       freshness < [N hours], null rate < [N]%
Quality:   [validation rules]
```

Append ML architecture section to the main architecture document.

---

## STEP 6 — SAGE-CONTRACT: API Contract Enforcer (on API changes)

When any new or modified API is introduced:

1. Generate OpenAPI 3.0 spec snippet for the endpoint.
2. Check for breaking changes vs existing published contracts:
   - Removed fields: BREAKING
   - Changed field types: BREAKING
   - Added required fields: BREAKING
   - Added optional fields: NON-BREAKING
3. Define versioning strategy if breaking change detected (v1 → v2 migration path).
4. Specify deprecation timeline for any removed/changed endpoints.
5. Generate Pact contract test skeleton.

Save API contract to: `specs/sage-api-contracts-[feature]-[YYYY-MM-DD].yaml`

---

## STEP 7 — SAGE-DEBT: Tech Debt Tracker (weekly / post-merge)

When invoked for debt scanning:
```bash
grep -r "TODO\|FIXME\|HACK\|XXX" src/ | grep -v node_modules
npx tsc --noEmit 2>&1 | wc -l
npm audit 2>&1
```

Catalog findings by risk:
- HIGH: can cause production incidents, security vulnerabilities
- MEDIUM: degrades maintainability, will slow future features
- LOW: style, naming, minor refactors

Output: Tech debt register + refactor proposals for HIGH items.

---

## OUTPUT

Save to: `specs/sage-architecture-[feature-name]-[YYYY-MM-DD].md`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 SAGE — ARCHITECTURE & DESIGN COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:       [name]
Date:          [today]
Source PRD:    specs/iris-prd-[feature]-[date].md

Data models:   [N] defined
API endpoints: [N] specified
DB changes:    [N] migrations planned
Integrations:  [N] external systems mapped
ADRs:          [N] decisions documented
STRIDE:        [PASS/RISK/FAIL per dimension]
Compliance:    [N/6 Greenshades checks passed]
Estimates:     [N] stories, ~[N] sprints total
ML arch:       [YES — included / NO — not applicable]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## HUMAN GATE — REQUIRED BEFORE FORGE

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 SAGE → FORGE  HUMAN GATE                                │
│                                                              │
│  Architecture: specs/sage-architecture-[feature]-[date].md  │
│                                                              │
│  Confirm before proceeding:                                  │
│  [ ] Architecture covers all P0 requirements from IRIS      │
│  [ ] All API contracts have typed request/response schemas  │
│  [ ] DB migrations have rollback procedures                 │
│  [ ] STRIDE threat model completed — no unmitigated FAIL    │
│  [ ] Greenshades compliance checklist all passed            │
│  [ ] Story estimates are realistic and dependencies mapped  │
│  [ ] ADRs documented for all major decisions                │
│  [ ] ML architecture included if ML feature detected        │
│  [ ] Tech lead has reviewed and signed off                  │
│                                                              │
│  next          → proceed to /forge                          │
│  revise: [x]   → fix specific section, re-display          │
│  stop          → save state to progress.md, halt            │
└─────────────────────────────────────────────────────────────┘
```
