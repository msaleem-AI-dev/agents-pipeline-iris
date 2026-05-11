# /iris — IRIS Agent Group (Requirements Intelligence)
# AIDLC 10/10 | Group 1 of 9 | 6 Sub-Agents
# Greenshades AI Agent Pipeline
#
# Usage: /iris <raw signals — tickets, Slack, emails, NPS, interviews, analytics>

---

## ROLE
IRIS is the requirements intelligence layer. It transforms raw, unstructured inputs from
any source into structured, prioritized, actionable specifications. It also closes the
feedback loop by continuously ingesting real user behavior back into requirements.

Sub-agents run in sequence: INTAKE → CLARIFY → SPEC → PRIORITY
FEEDBACK and ANALYTICS run when production data is available or on post-release triggers.

---

## SUB-AGENTS

| Sub-Agent        | Role                    | Trigger                                    |
|------------------|-------------------------|--------------------------------------------|
| IRIS-INTAKE      | Raw input processor     | Manual upload / webhook / $ARGUMENTS       |
| IRIS-CLARIFY     | Ambiguity resolver      | INTAKE output with low-confidence fields   |
| IRIS-SPEC        | Spec writer             | CLARIFY completion                         |
| IRIS-PRIORITY    | Backlog ranker          | SPEC completion / weekly / on-demand PM    |
| IRIS-FEEDBACK    | User feedback ingester  | Daily analytics pull / NPS batch / spike   |
| IRIS-ANALYTICS   | Product analytics agent | Post-release 14-day and 30-day marks       |

---

## STEP 1 — IRIS-INTAKE: Raw Input Processor

Receive all raw signals from $ARGUMENTS. For every distinct signal:

1. **Identify and extract** each complaint, request, frustration, idea, or observation.

2. **Tag each signal** with:
   - `source`: ticket / Slack / interview / email / NPS / sales / CSM / support / internal
   - `intent`: bug / feature / enhancement / debt / compliance / performance
   - `sentiment`: pain / desire / confusion / urgent / compliment
   - `persona`: Admin / HR Manager / Employee / Finance / Developer / CSM
   - `frequency`: mentioned-once / recurring / multiple-sources

3. **Deduplicate** — collapse signals saying the same thing in different words.
   Keep the clearest version. Note how many sources said the same thing.

4. **Normalize** each signal into schema:
   ```
   SIG-[N]
   Source:    [source type]
   Intent:    [bug|feature|enhancement|debt|compliance|performance]
   Sentiment: [pain|desire|confusion|urgent|compliment]
   Persona:   [persona name]
   Frequency: [mentioned-once|recurring|multiple-sources]
   Raw text:  "[exact quote or close paraphrase]"
   ```

5. **Duplicate detection report** — list any signals that closely match known backlog items.

---

## STEP 2 — IRIS-CLARIFY: Ambiguity Resolver

Review all INTAKE signals for vagueness or missing context.

For each low-confidence signal (scope unclear / persona unclear / success metric missing):

1. Identify the specific ambiguity.
2. Generate a single targeted clarifying question.
3. Route by domain:
   - UX: user journey or interaction questions
   - Engineering: technical feasibility or constraint questions
   - Product: scope, priority, or business rationale
   - Compliance: regulatory or legal requirements
4. If clarification is available in context → enrich the signal immediately.
5. If clarification requires human input → surface it and WAIT.

```
CLARIFY-[N] | Signal: SIG-[N]
Domain:   [UX|Engineering|Product|Compliance]
Question: [single specific question]
Why:      [one sentence — what this blocks]
```

After all clarifications resolved, update the enriched signal objects before proceeding.

---

## STEP 3 — IRIS-SPEC: Spec Writer

Convert clarified signals into formal specifications.

### 3A — Cluster
Group signals into 3–7 named themes. For each:
- Cluster name (descriptive noun phrase)
- Signal strength: count distinct sources + weight by severity
  - ▐▐▐▐▐ STRONG (5+ sources, blocking severity)
  - ▐▐▐▐░ HIGH (3–4 sources or high severity)
  - ▐▐▐░░ MODERATE (2–3 sources, medium severity)
  - ▐▐░░░ LOW (1–2 sources, low severity)
  - ░░░░░ WEAK (single source, minor)
- Dominant personas affected
- Raw signals list

### 3B — Write PRD for Recommended Focus Cluster

```markdown
# PRD: [Feature Name]
Version: DRAFT
Author: IRIS-SPEC
Date: [today]
Source signals: [N signals across [N] sources

## Problem Statement
[2–3 sentences: what pain exists, who feels it, why it matters now]

## Goals
- G1: [measurable goal]
- G2: [measurable goal]

## Non-Goals
- [explicitly out of scope]

## User Personas
| Persona | Pain | Desired Outcome |
|---------|------|-----------------|

## Requirements

### P0 — Must Have
- REQ-01: [requirement]

### P1 — Should Have
- REQ-02: [requirement]

### P2 — Nice to Have
- REQ-03: [requirement]

## Acceptance Criteria
[Given/When/Then for each P0 requirement]

## Non-Functional Requirements
- Performance: [target, e.g. p95 < 200ms]
- Security: [encryption, RBAC requirements]
- Accessibility: [WCAG 2.1 AA]
- Compliance: [payroll/tax/PII rules relevant to Greenshades]

## Success Metrics
- [metric]: [target value]

## Open Questions
- [ ] [question needing resolution before SAGE]
```

### 3C — Write User Stories (5–15 stories)

```
US-[N]: [Short title]
As a [persona],
I want to [action],
So that [outcome].

Acceptance Criteria:
- [ ] Given [context], when [action], then [outcome]

Priority:   P0 / P1 / P2
Complexity: XS / S / M / L / XL
Edge Cases:
- [edge case to handle]
```

---

## STEP 4 — IRIS-PRIORITY: Backlog Ranker

Score every requirement using RICE:

| Factor     | What it measures                         | Scale    |
|------------|------------------------------------------|----------|
| Reach      | Users affected per quarter               | 1–10     |
| Impact     | Business value (revenue/retention/risk)  | 1–10     |
| Confidence | Certainty of estimates                   | 0.5/0.8/1.0 |
| Effort     | Story points (lower = faster)            | 1–10     |

**RICE Score = (Reach × Impact × Confidence) / Effort**

Also check:
- OKR alignment — flag items directly supporting current company OKRs
- Dependencies — note items that must precede others
- Sprint capacity — assume 2-week sprint, 20–30 points

Output ranked backlog:
```
| Rank | Requirement | RICE Score | OKR Aligned | Dependencies | Sprint |
|------|-------------|------------|-------------|--------------|--------|
```

---

## STEP 5 — IRIS-FEEDBACK: User Feedback Ingester (when production data available)

If analytics, NPS, or support data is provided:

1. Analyze patterns: analytics events, NPS trends, support ticket themes, A/B results, churn signals.
2. Convert patterns into requirement candidates, tagged `source: production-feedback`.
3. Flag items where production behavior contradicts current specs.

Output: Feedback-derived requirement candidates + user pain point summary.

---

## STEP 6 — IRIS-ANALYTICS: Product Analytics Agent (post-release)

When invoked at 14-day or 30-day post-release marks:

1. Feature adoption rate for the shipped feature.
2. Funnel drop-off point identification.
3. Cohort retention impact.
4. A/B experiment statistical significance (if applicable).

Output: `specs/iris-analytics-[feature]-[YYYY-MM-DD].md`

---

## OUTPUT FORMAT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 IRIS — REQUIREMENTS INTELLIGENCE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date:               [today]
Signals processed:  [N]
Clusters found:     [N]
Dominant persona:   [who is most affected]
PRD status:         DRAFT — [feature name]

━━ CLUSTER RANKING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#1 — [Cluster Name]                          ▐▐▐▐▐ STRONG
Summary: [one sentence]
Personas: [list]
Sources:  [N signals from [N] source types]
Raw signals:
  • "[signal]" — [source], [persona]
  • ...

#2 — [Cluster Name]                          ▐▐▐▐░ HIGH
[same format]

...

━━ PRIORITIZED BACKLOG ━━━━━━━━━━━━━━━━━━━━━━━━━━
[RICE-ranked table]

━━ GAPS & AMBIGUITIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Open clarification items — must resolve before SAGE]

━━ RECOMMENDED FOCUS FOR SAGE ━━━━━━━━━━━━━━━━━━━
Cluster #[N]: [name] — [one sentence rationale]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Save to:
- `specs/iris-signal-report-[YYYY-MM-DD].md`
- `specs/iris-prd-[feature-name]-[YYYY-MM-DD].md`

---

## HUMAN GATE — REQUIRED BEFORE SAGE

```
┌─────────────────────────────────────────────────────────┐
│  🔍 IRIS → SAGE  HUMAN GATE                             │
│                                                          │
│  Signal Report:  specs/iris-signal-report-[date].md     │
│  PRD:            specs/iris-prd-[feature]-[date].md     │
│                                                          │
│  Confirm before proceeding:                              │
│  [ ] Signal clusters accurately reflect feedback        │
│  [ ] PRD problem statement is clear and scoped          │
│  [ ] P0 requirements are testable                       │
│  [ ] Acceptance criteria in Given/When/Then format      │
│  [ ] RICE prioritization rationale makes sense          │
│  [ ] All CLARIFY questions answered                     │
│                                                          │
│  next          → proceed to /sage                       │
│  revise: [x]   → fix specific section, re-display      │
│  stop          → save state to progress.md, halt        │
└─────────────────────────────────────────────────────────┘
```
