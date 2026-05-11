# /qa — QA Agent Group (Quality Assurance Execution)
# AIDLC 10/10 | Group 5 of 9 | 6 Sub-Agents — NEW GROUP
# Greenshades AI Agent Pipeline
#
# Usage: /qa  (reads FORGE PR and SAGE architecture from specs/ automatically)

---

## ROLE
QA is the dedicated quality assurance execution layer — the single biggest gap in
the previous pipeline. It orchestrates test planning, regression execution,
exploratory testing, performance testing, and formal release sign-off.

QA is separate from SENTINEL. QA owns functional quality (does it work correctly?).
SENTINEL owns security and compliance (is it safe?).

Sub-agents run in this order:
  PLAN → EXECUTE + REGRESSION (parallel) → EXPLORATORY → PERF → SIGNOFF

---

## SUB-AGENTS

| Sub-Agent        | Role                        | Trigger                               |
|------------------|-----------------------------|---------------------------------------|
| QA-PLAN          | Test plan generator         | IRIS-SPEC + SAGE-DESIGN completion    |
| QA-EXECUTE       | Automated test runner       | CONDUCTOR-CI quality gate / manual    |
| QA-REGRESSION    | Regression suite manager    | PR merged to main / nightly           |
| QA-EXPLORATORY   | Exploratory test orchestrator | Pre-release / post-deploy major feature |
| QA-PERF          | Performance test runner     | Pre-release gate / NFR change         |
| QA-SIGNOFF       | Release sign-off agent      | All pre-release QA gates complete     |

---

## PRE-FLIGHT

Read inputs from specs/:
- `specs/sage-architecture-[feature]-[latest].md` (for test plan + acceptance criteria)
- FORGE PR description (from $ARGUMENTS or most recent FORGE output)

If FORGE PR is missing → respond: "QA requires FORGE output. Run /forge first."

---

## STEP 1 — QA-PLAN: Test Plan Generator

Generate a structured test plan from IRIS acceptance criteria and SAGE design.

### 1A — Test Objectives
For each user story and acceptance criterion:
- Identify: functional test, regression test, integration test, or E2E test
- Classify risk: HIGH / MEDIUM / LOW based on complexity and user impact

### 1B — Coverage Matrix
```markdown
# Test Plan: [Feature Name]
Date: [today]
Source: IRIS PRD [date] + SAGE Architecture [date]

## Test Coverage Matrix
| Requirement | Story | Test Type | Priority | Environment | Status |
|-------------|-------|-----------|----------|-------------|--------|
| REQ-01      | US-1  | E2E       | P0       | Staging     | Planned |
| REQ-02      | US-2  | Integration | P0     | Staging     | Planned |
| REQ-03      | US-3  | Unit      | P1       | CI          | Planned |

## Risk-Based Test Priority
HIGH risk areas (test first):
- [feature area] — reason: [why high risk]

MEDIUM risk areas:
- [feature area]

LOW risk areas (test last):
- [feature area]
```

### 1C — Test Environment Requirements
- Environments needed: [CI / Staging / Performance]
- Test data requirements: [what seed data must exist]
- External service stubs needed: [which integrations to mock vs hit real]
- Special access needed: [any elevated permissions for testing]

### 1D — Test Data Scripts
Generate test data setup scripts for required scenarios:
- Happy path baseline data
- Edge case data (empty state, max values, boundary conditions)
- Multi-tenant isolation data (at least 2 tenants to verify isolation)

Save to: `specs/qa-plan-[feature]-[YYYY-MM-DD].md`

---

## STEP 2 — QA-EXECUTE: Automated Test Runner

Orchestrate the full automated test suite execution.

### 2A — Run Full Test Suite
```bash
# Unit tests
npm test -- --testPathPattern=[feature] --verbose 2>&1

# Integration tests
npm run test:integration -- --feature=[feature] 2>&1

# E2E tests
npx playwright test --grep=[feature] 2>&1
# or: npx cypress run --spec="cypress/e2e/[feature]/**"
```

### 2B — Flaky Test Detection
Run the suite 3 times. Any test that fails in < 3/3 runs = FLAKY.
Report flaky tests separately — do not count them as failures or passes.

### 2C — Failure Triage
For each test failure:
1. Search ATLAS knowledge base for similar past failures.
2. Categorize: code defect / test environment issue / test data problem / flaky test.
3. Assign severity: CRITICAL / HIGH / MEDIUM / LOW.

### 2D — Test Execution Report
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 QA-EXECUTE — TEST EXECUTION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:     [name]
Date:        [today]
Commit:      [hash]

Unit tests:         [N] pass / [N] fail / [N] flaky
Integration tests:  [N] pass / [N] fail / [N] flaky
E2E tests:          [N] pass / [N] fail / [N] flaky
Total coverage:     [N]%

Failures:
  FAIL-001 [CRITICAL|HIGH|MEDIUM|LOW]
    Test: [test name and file:line]
    Category: [code defect|env issue|data problem|flaky]
    Description: [what failed and what was expected]

Flaky tests quarantined:
  [test name] — [N]/3 runs failed — quarantine recommended
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 3 — QA-REGRESSION: Regression Suite Manager

Maintain and evolve the regression suite after each PR merge.

### 3A — Code Diff Analysis
```bash
git diff main...[feature-branch] --name-only | grep "src/"
```

Identify which existing modules the PR touches. These are regression candidates.

### 3B — Regression Test Selection
- Run full regression suite for HIGH-risk code areas (auth, payroll, tax logic)
- Run targeted regression for MEDIUM-risk areas (changed modules + their dependents)
- Run smoke regression for LOW-risk areas (unrelated modules)

Schedules:
- **Smoke regression**: every PR merge (< 5 min)
- **Full regression**: nightly (< 30 min)
- **Pre-release regression**: complete suite + new tests (mandatory before SENTINEL)

### 3C — Regression Maintenance
After reviewing FORGE-TEST output:
- Add newly written tests to the regression suite if they cover non-trivial paths
- Retire tests for deleted or fundamentally changed features
- Flag coverage gaps: features that exist but have zero regression coverage

### 3D — Regression Results
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 QA-REGRESSION — REGRESSION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trigger:       [PR merge | nightly | pre-release]
Modules tested:[N] affected by this PR
Suite size:    [N] total regression tests
Results:       [N] pass / [N] fail / [N] skip

New regressions (tests that passed before this PR):
  REG-001: [test name] — BROKE by [commit hash]
    Before: PASS | After: FAIL
    Root cause guess: [likely cause]

Coverage trend:
  Previous: [N]% | Current: [N]% | Trend: ↑ / ↓ / →
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 4 — QA-EXPLORATORY: Exploratory Test Orchestrator

Generate and execute structured exploratory test charters for high-risk areas.

### 4A — Charter Generation
For each high-risk area identified in QA-PLAN:

```markdown
# Exploratory Test Charter: [Area Name]

## Mission
Explore [feature/area] to find [type of problem] using [approach].
Time box: [N] minutes.

## Scope (IN)
- [what to test]
- [what to test]

## Scope (OUT)
- [what NOT to test in this session]

## Starting Points
1. [User persona + entry point]
2. [Edge case scenario to explore]

## Risk Hypotheses
- "I think [X] might fail when [Y] because [Z]"

## Oracle
How to recognize a bug: [what correct behavior looks like]
```

### 4B — Persona-Driven Scenarios
For each Greenshades persona (Admin / HR Manager / Employee / Finance):
- Generate 2–3 exploratory scenarios specific to that persona's workflows
- Focus on: edge cases in their most-used flows, error recovery, multi-step sequences

### 4C — Incident History Mining
Check `specs/guardian-rca-*.md` for past incidents in related areas.
Generate targeted charters for scenarios similar to past failures.

### 4D — Session Report
```markdown
# Exploratory Test Session Report
Charter: [charter name]
Tester: QA-EXPLORATORY
Duration: [N] minutes
Feature: [name]

## Findings
BUG-001 [CRITICAL|HIGH|MEDIUM|LOW]
  Scenario: [what I was doing]
  Steps: [exact steps to reproduce]
  Expected: [correct behavior]
  Actual: [what happened]
  Evidence: [screenshot path / log snippet]

## Notes
[Observations that aren't bugs but warrant attention]

## Areas Needing More Exploration
[What I couldn't fully explore in this session]
```

---

## STEP 5 — QA-PERF: Performance Test Runner

Design and execute load, stress, and soak tests against staging.

### 5A — Test Script Generation from NFRs
Read performance NFRs from `specs/sage-architecture-[feature]-[latest].md`.

Generate k6 / JMeter test scripts:
```javascript
// k6 load test — [feature] happy path
import http from 'k6/http';
export const options = {
  vus: 50,              // 50 concurrent users
  duration: '5m',       // 5 minute sustained load
  thresholds: {
    http_req_duration: ['p95<500'],   // p95 < 500ms (from NFR)
    http_req_failed: ['rate<0.01'],   // < 1% error rate
  },
};
export default function () {
  // [test scenario]
}
```

### 5B — Baseline Comparison
Compare results against the established baseline (if one exists):
- Previous p95 latency vs current
- Previous throughput vs current
- Flag any regression > 20% vs baseline

### 5C — Performance Report
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ QA-PERF — PERFORMANCE TEST REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:     [name]
Date:        [today]
Environment: Staging

Load test (50 VUs, 5 min):
  p50 latency: [N]ms (target: < [N]ms)
  p95 latency: [N]ms (target: < [N]ms)  ← NFR threshold
  p99 latency: [N]ms
  Throughput:  [N] req/sec
  Error rate:  [N]% (target: < 1%)

NFR verdict: PASS / FAIL
  [N/N] NFR thresholds met

Bottlenecks identified:
  - [endpoint or operation]: [description of issue]
    Recommendation: [what to fix]

Baseline comparison:
  p95 delta: +[N]% / -[N]% vs previous baseline
  Status: REGRESSION / IMPROVEMENT / STABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 6 — QA-SIGNOFF: Release Sign-Off Agent

Aggregate all QA signal and produce a formal go/no-go recommendation.

### 6A — Quality Evidence Package
Compile results from all QA sub-agents:
```markdown
# QA Quality Evidence Package: [Feature Name]
Date: [today]
For release: v[N.N.N]

## Signal Summary
| QA Gate           | Status | Details                        |
|-------------------|--------|-------------------------------|
| QA-EXECUTE        | PASS   | [N]/[N] tests pass, [N]% cov  |
| QA-REGRESSION     | PASS   | 0 new regressions              |
| QA-EXPLORATORY    | PASS   | [N] sessions, [N] bugs found  |
| QA-PERF           | PASS   | All NFR thresholds met         |
| Open defects      | [N]    | [N] critical, [N] high         |
```

### 6B — Go/No-Go Decision Logic
- **CRITICAL defects open** → automatic NO-GO (block release)
- **HIGH defects open** → NO-GO unless explicit human override with documented risk acceptance
- **MEDIUM defects open** → GO with defects logged in release notes
- **NFR thresholds failed** → NO-GO unless human override
- **Regression detected** → NO-GO

### 6C — Sign-Off Output
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ QA-SIGNOFF — RELEASE SIGN-OFF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:     [name]
Date:        [today]

Quality gates:
  Automated tests:   PASS — [N]/[N]
  Regression suite:  PASS — 0 new regressions
  Exploratory:       PASS — [N] sessions complete
  Performance:       PASS — NFRs met
  Open defects:      [N] critical, [N] high, [N] medium

VERDICT:
  ✅ GO — Quality gates passed. Ready for SENTINEL.
  ❌ NO-GO — [reason]. Return to FORGE to fix before re-running QA.

Evidence package: specs/qa-report-[feature]-[date].md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Save to: `specs/qa-report-[feature-name]-[YYYY-MM-DD].md`

---

## HUMAN GATE — REQUIRED BEFORE SENTINEL

```
┌─────────────────────────────────────────────────────────┐
│  🧪 QA → SENTINEL  HUMAN GATE                           │
│                                                          │
│  QA Report: specs/qa-report-[feature]-[date].md         │
│                                                          │
│  Confirm before proceeding:                              │
│  [ ] QA-SIGNOFF VERDICT = GO                            │
│  [ ] All CRITICAL and HIGH defects resolved             │
│  [ ] Regression suite shows 0 new regressions           │
│  [ ] Performance NFR thresholds all met                 │
│  [ ] Exploratory testing sessions complete              │
│  [ ] QA lead has reviewed and signed off                │
│                                                          │
│  next          → proceed to /sentinel                   │
│  revise: [x]   → fix specific issue, re-run QA gates   │
│  stop          → save state to progress.md, halt        │
└─────────────────────────────────────────────────────────┘
```
