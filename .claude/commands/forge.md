# /forge — FORGE Agent Group (Code Generation & Implementation)
# AIDLC 10/10 | Group 4 of 9 | 8 Sub-Agents
# Greenshades AI Agent Pipeline
#
# Usage: /forge  (reads SAGE architecture from specs/ automatically)

---

## ROLE
FORGE is the build layer. It generates production-ready code, tests, migrations,
infrastructure, and API mocks from the SAGE architecture document.

Sub-agents run in this order:
  BUILD → TEST (parallel with BUILD) → MIGRATE (if DB changes) →
  IaC (if infra changes) → REVIEW → MOCK (if new APIs) → DATAPIPELINE (if ML)
  REFACTOR runs separately when triggered by SAGE-DEBT approved tickets.

---

## SUB-AGENTS

| Sub-Agent            | Role                      | Trigger                                   |
|----------------------|---------------------------|-------------------------------------------|
| FORGE-BUILD          | Feature implementer       | IRIS-SPEC + SAGE-DESIGN ready             |
| FORGE-TEST           | Test writer               | FORGE-BUILD PR creation                   |
| FORGE-MIGRATE        | DB migration writer       | SAGE-DESIGN DB schema change detected     |
| FORGE-IaC            | Infrastructure coder      | SAGE-DESIGN infra change detected         |
| FORGE-REVIEW         | Code reviewer             | Pull request opened or updated            |
| FORGE-REFACTOR       | Code refactorer           | SAGE-DEBT approved refactor ticket        |
| FORGE-DATAPIPELINE   | Data pipeline builder     | SAGE-MLARCH data contract spec            |
| FORGE-MOCK           | API mock generator        | SAGE-CONTRACT API spec published          |

---

## PRE-FLIGHT

Read SAGE architecture from specs/:
- `specs/sage-architecture-[feature]-[latest].md`

If missing → respond: "FORGE requires a SAGE architecture document. Run /sage first."

Environment checks:
```bash
node --version 2>/dev/null || python --version
ls src/ tests/ 2>/dev/null
find src/ -name "*.ts" | head -10 2>/dev/null
cat package.json 2>/dev/null | grep '"scripts"' -A 20
```

If SAGE architecture has unresolved open risks → STOP. Surface them. Do not build until resolved.

---

## STEP 1 — FORGE-BUILD: Feature Implementer

Build production-ready code following the SAGE architecture exactly.

### 1A — Data Models & Types
Implement every data model from the architecture document.

File: `src/[feature]/types.ts` (or `models.py`)

Rules:
- Never use `any` — all fields must be typed
- Always include `tenantId: string` on every entity (multi-tenant)
- Always include `createdBy: string` on mutable entities (audit trail)
- Match naming conventions from existing codebase

```bash
npx tsc --noEmit   # zero errors required before next step
```

### 1B — Database Migration (if SAGE specifies DB changes)

Write migration following existing migration tool patterns (Flyway / Liquibase / Alembic / custom).

File: `migrations/[timestamp]_[feature-name].ts`

Requirements:
- Every migration must have a rollback (down) function
- No destructive operations without explicit human approval in gate
- Include row-count validation queries
- Add comments explaining what and why

**Do NOT run the migration.** Flag it for human review at gate.

### 1C — Write Failing Tests First (TDD)
For every user story acceptance criterion (Given/When/Then):
Write a test that currently FAILS.

```bash
npm test -- --testPathPattern=[feature] 2>&1 | tail -20
```

Tests must be RED. If any pass before implementation → the test is wrong. Fix it.

### 1D — Implement Feature
Build in this order, verifying types after each layer:

1. **Data access layer** (repository pattern, all queries include `WHERE tenant_id = $tenantId`)
2. **Service / business logic layer** (no direct DB calls — use repository)
3. **API controllers / route handlers** (RBAC checks on every handler)
4. **UI components** (if applicable — follow existing component patterns)

Rules:
- No logic not specified in the SAGE architecture
- Match existing code style exactly (indentation, naming, file structure)
- Every function has a type signature
- Audit log entry on every state change: `{ action, userId, tenantId, entityId, timestamp }`
- No hardcoded credentials, API keys, or connection strings

### 1E — PR Description
```markdown
## PR: [Feature Name]
Type: feat / fix / refactor
References: SAGE Architecture [date] | IRIS PRD [date]

### What this PR does
[2–3 sentences]

### Changes
- `src/[file]` — [what changed and why]
- `tests/[file]` — [what was tested]
- `migrations/[file]` — [schema change] ⚠️ REQUIRES MIGRATION RUN

### Test coverage
- [N] tests added
- Coverage: [N]%
- User stories covered: US-[N], US-[N]

### Security checklist
- [x] No hardcoded secrets
- [x] Input validated at all API boundaries
- [x] RBAC checks applied per architecture
- [x] PII fields encrypted / masked in logs
- [x] SQL queries parameterized
- [x] Audit log entries written for state changes
- [x] Error messages don't leak internal details

### How to test
1. [step]
2. [step]
```

---

## STEP 2 — FORGE-TEST: Test Writer

Generate comprehensive test coverage alongside BUILD.

Test types to cover:
- **Unit tests** (Jest / pytest / xUnit): pure function logic, edge cases
- **Integration tests**: API endpoints with real DB (no mocks for DB — integration tests must hit real DB)
- **E2E tests** (Playwright / Cypress): critical user journeys end-to-end

Coverage gap analysis:
```bash
npm test -- --coverage --testPathPattern=[feature] 2>&1 | grep "Uncovered"
```

For each uncovered branch or function → write a test.

Minimum coverage target: 80% for new code.

---

## STEP 3 — FORGE-MIGRATE: DB Migration Writer (when DB changes present)

Produce safe, reversible migration scripts:

```typescript
// migrations/[timestamp]_[feature-name].ts
export async function up(db: Database): Promise<void> {
  // Forward migration
  await db.query(`
    CREATE TABLE [table_name] (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id   UUID NOT NULL REFERENCES tenants(id),
      -- ... columns per SAGE data model
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by  UUID NOT NULL
    );
    CREATE INDEX idx_[table]_tenant ON [table_name](tenant_id);
  `);
}

export async function down(db: Database): Promise<void> {
  // Rollback — must be reversible
  await db.query(`DROP TABLE IF EXISTS [table_name];`);
}
```

Migration risk assessment (from SAGE):
- **LOW**: additive-only changes (new table, new nullable column, new index)
- **MEDIUM**: new NOT NULL column with default, dropping index
- **HIGH**: dropping column, changing type, renaming — requires data backfill plan

Flag HIGH risk migrations for explicit human confirmation at the SAGE gate.
**Never run migrations autonomously.** Show to human and wait for "Run migration" confirmation.

---

## STEP 4 — FORGE-IaC: Infrastructure Coder (when infra changes present)

Generate infrastructure-as-code for new services or environments:

- Terraform / Pulumi / CloudFormation templates for new resources
- Kubernetes manifests for new services
- Environment variable documentation for new services

Include cost estimate comment:
```hcl
# Estimated cost: ~$[N]/month (based on [instance type / storage size])
```

Check environment parity — staging config must mirror production structure.

---

## STEP 5 — FORGE-REVIEW: Code Reviewer

Automated code review on every PR. Check for:

**Security (OWASP Top 10):**
- [ ] SQL injection: all queries parameterized?
- [ ] XSS: all user output escaped?
- [ ] Broken authentication: auth checks on every protected route?
- [ ] Sensitive data exposure: PII/credentials never logged?
- [ ] Broken access control: tenant_id and RBAC enforced?

**Performance:**
- [ ] N+1 query patterns (loops with DB calls)
- [ ] Missing indexes on filtered/joined columns
- [ ] Unbounded queries (missing LIMIT on list endpoints)
- [ ] Synchronous operations that should be async

**Maintainability:**
- [ ] Functions > 40 lines flagged for decomposition
- [ ] Cyclomatic complexity > 10 flagged
- [ ] Magic numbers / strings (should be named constants)

**Verdict:** APPROVE / REQUEST_CHANGES / BLOCK

Output PR review comments in this format:
```
REVIEW-[N] [SECURITY|PERF|STYLE|BUG] [BLOCKER|WARNING|INFO]
File: [path:line]
Issue: [what the problem is]
Recommendation: [what to do instead]
```

---

## STEP 6 — FORGE-REFACTOR: Code Refactorer (on SAGE-DEBT approved tickets)

When a SAGE-DEBT approved refactor ticket is received:

1. Read the tech debt item and understand the target refactoring.
2. Execute the refactoring (extract method, rename, restructure, remove duplication).
3. Run full test suite — confirm zero regressions.
4. Generate refactor PR with before/after explanation.

PR description must include:
- Why this refactor was needed (link to SAGE-DEBT ticket)
- What changed (before/after code snippet or description)
- Proof that all existing tests still pass
- Impact analysis (which other modules may be affected)

---

## STEP 7 — FORGE-DATAPIPELINE: Data Pipeline Builder (when SAGE-MLARCH data contract present)

When a data contract spec is available from SAGE-MLARCH:

1. **dbt models**: generate transformation SQL from data contract schema.
2. **Pipeline DAGs**: scaffold Airflow DAG for batch processing.
3. **Data quality checks**: inject Great Expectations / dbt tests for each contract field.
4. **Schema migration**: generate schema evolution scripts for breaking contract changes.

File structure:
```
dbt/
  models/[feature]/
    [entity].sql
    schema.yml        ← Great Expectations-style tests
airflow/
  dags/[feature]_pipeline.py
```

---

## STEP 8 — FORGE-MOCK: API Mock Generator (when SAGE-CONTRACT spec published)

When a new API spec is published by SAGE-CONTRACT:

1. Generate mock server config (Prism / WireMock) from the OpenAPI spec.
2. Define stateful scenarios (e.g., "user not found", "insufficient permissions", "success").
3. Generate stub library for frontend teams.
4. Document mock environment URL and available scenarios.

Output: `specs/forge-mocks-[feature]-[YYYY-MM-DD].md` with setup instructions.

---

## VERIFICATION LOOP (max 3 cycles)

After each build layer:
```bash
npx tsc --noEmit            # type check — zero errors
npx eslint src/ tests/      # lint — zero errors
npm test -- --coverage      # tests — all green, >80% coverage
```

If red after 3 cycles → STOP and surface the blocker to human. Do not continue.

---

## OUTPUT SUMMARY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚒️  FORGE — BUILD COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:         [name]
Files created:   [N]
Tests:           [N] passing, 0 failing
Coverage:        [N]%
Type check:      CLEAN
Lint:            CLEAN
Security review: [N/7] checks passed
Migration:       [YES — [filename] / NO]
IaC:             [YES — [filename] / NO]
Mocks:           [YES — [filename] / NO]
PR:              Ready for review
Commit:          [hash]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## HUMAN GATE — REQUIRED BEFORE QA

```
┌─────────────────────────────────────────────────────────┐
│  ⚒️  FORGE → QA  HUMAN GATE                             │
│                                                          │
│  Confirm before proceeding:                              │
│  [ ] PR reviewed by at least 1 engineer                 │
│  [ ] All tests passing in CI                            │
│  [ ] FORGE-REVIEW verdict: APPROVE                      │
│  [ ] Migration reviewed (if applicable)                 │
│  [ ] Security checklist all 7 items passed              │
│  [ ] IaC reviewed (if applicable)                       │
│  [ ] No open blocking PR comments                       │
│                                                          │
│  next          → proceed to /qa                         │
│  revise: [x]   → fix specific issue, re-display        │
│  stop          → save state to progress.md, halt        │
└─────────────────────────────────────────────────────────┘
```
