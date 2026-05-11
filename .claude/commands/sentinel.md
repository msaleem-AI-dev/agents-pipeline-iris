# /sentinel — SENTINEL Agent Group (Security & Compliance Intelligence)
# AIDLC 10/10 | Group 6 of 9 | 8 Sub-Agents
# Greenshades AI Agent Pipeline
#
# Usage: /sentinel  (reads QA report + FORGE PR from specs/ automatically)

---

## ROLE
SENTINEL is the security guardian of the pipeline. It runs independent security and
compliance analysis — separate from QA's functional testing. SENTINEL answers:
"Is it safe?" QA answers: "Does it work?"

Sub-agents activate by trigger:
- SCAN: every PR open/update
- DEPS: daily + new dependency added
- DAST: after staging deploy
- COMPLY: weekly + pre-audit
- ACCESS: quarterly + anomaly event
- PENTEST: pre-release + quarterly
- SBOM: every release tag
- CHAOS: pre-release + bi-weekly

For the pipeline gate: SCAN → DAST → COMPLY → PENTEST → SBOM → CHAOS → VERDICT

---

## SUB-AGENTS

| Sub-Agent        | Role                        | Trigger                                     |
|------------------|-----------------------------|---------------------------------------------|
| SENTINEL-SCAN    | Static security scanner     | PR opened / post-merge to main              |
| SENTINEL-DEPS    | Dependency auditor          | Daily scan / new dependency added           |
| SENTINEL-DAST    | Dynamic scanner             | Staging deploy event                        |
| SENTINEL-COMPLY  | Compliance checker          | Weekly scheduled / pre-audit trigger        |
| SENTINEL-ACCESS  | Access reviewer             | Quarterly scheduled / anomaly detection     |
| SENTINEL-PENTEST | Automated pen tester        | Pre-release gate / quarterly                |
| SENTINEL-SBOM    | Supply chain / SBOM agent   | Every release tag / weekly full-scan        |
| SENTINEL-CHAOS   | Chaos engineering agent     | Pre-release gate / bi-weekly chaos day      |

---

## PRE-FLIGHT

Read inputs from specs/:
- `specs/qa-report-[feature]-[latest].md` — must show QA-SIGNOFF VERDICT = GO
- FORGE PR description

If QA verdict is not GO → respond: "SENTINEL requires QA sign-off. Run /qa first."

---

## STEP 1 — SENTINEL-SCAN: Static Security Scanner

Run SAST analysis on every new or changed file in the PR.

```bash
# Static analysis
npx semgrep --config=auto src/ 2>&1
# or: CodeQL analysis, Snyk Code scan

# Secrets detection
npx gitleaks detect --source . 2>&1
# or: truffleHog scan
```

Check for:
- **Injection flaws**: SQL, command, LDAP, XPath injection patterns
- **Hardcoded credentials**: API keys, passwords, connection strings in code
- **Insecure configs**: debug flags in production code, insecure TLS settings
- **Known vulnerability patterns**: OWASP Top 10 code signatures
- **PII in logs**: email, SSN, tax ID, bank account logged in plaintext

CVSS-score each finding and generate remediation guidance.

```
SCAN-[N] [CRITICAL|HIGH|MEDIUM|LOW]  CVSS: [N.N]
File: [path:line]
Type: [injection|secret|config|OWASP|PII-leak]
Description: [what the vulnerability is]
Remediation: [specific fix to apply]
```

Block signal: any CRITICAL or HIGH finding BLOCKS the pipeline.

---

## STEP 2 — SENTINEL-DEPS: Dependency Auditor

```bash
npm audit --json 2>&1
# or: pip audit, cargo audit, govulncheck
```

For each vulnerable dependency:
1. Check CVE severity (NVD / OSV / GitHub Advisory DB).
2. Check license: GPL / AGPL licenses require approval before use.
3. Check for deprecated packages (>2 years since last publish, zero maintenance).
4. Generate auto-upgrade PR for patch-level bumps.

```
DEP-[N] [CRITICAL|HIGH|MEDIUM|LOW]
Package: [name]@[version]
CVE: [CVE-YYYY-NNNNN]
Fix: upgrade to [version]
Breaking change: YES/NO
Auto-PR: [GENERATED | MANUAL — breaking change requires review]
```

---

## STEP 3 — SENTINEL-DAST: Dynamic Scanner

Run against staging environment after deploy (requires staging URL).

If staging URL not available → note the gap and proceed with SAST findings only.

```bash
# OWASP ZAP active scan
zap-cli --zap-url http://[staging-url] active-scan 2>&1
# or: Burp Suite Pro headless scan
```

Test:
- **Authentication**: attempt access without token, with expired token, with wrong token
- **Authorization**: attempt cross-tenant data access (IDOR), role bypass attempts
- **Input fuzzing**: inject malformed payloads to all input fields
- **Session management**: session fixation, session timeout, concurrent session limits
- **API endpoint fuzzing**: undocumented endpoints, HTTP verb tampering

```
DAST-[N] [CRITICAL|HIGH|MEDIUM|LOW]
Endpoint: [method path]
Attack: [what was attempted]
Result: [what was found — without exposing exploit details]
Remediation: [fix]
```

---

## STEP 4 — SENTINEL-COMPLY: Compliance Checker

Validate against applicable compliance frameworks for Greenshades:

### Greenshades-Specific Compliance (mandatory on every run)
- [ ] All payroll calculations are isolated — no cross-tenant contamination
- [ ] Tax withholding logic matches IRS/state tables (W4, W2, 1099)
- [ ] Audit trail: every state-change has a timestamped, immutable log entry
- [ ] PII fields (SSN, bank account, DOB) encrypted at rest and in transit
- [ ] Multi-tenant isolation verified: every DB query scoped by tenant_id
- [ ] RBAC: Admin / HR Manager / Employee / Finance roles correctly enforced

### General Compliance Frameworks
- **SOC 2 Type II**: access controls, availability, confidentiality, processing integrity
- **HIPAA** (if benefits/health data): PHI handling, minimum necessary access
- **PCI-DSS** (if payment data): cardholder data isolation, transmission security
- **GDPR** (if EU data): data minimization, consent, right-to-erasure capability

For each compliance item: PASS / FAIL / N/A + evidence path

Generate gap remediation tickets for any FAIL items.

```
COMPLY-[N] [CRITICAL|HIGH|MEDIUM|LOW]
Framework: [SOC2|HIPAA|PCI-DSS|GDPR|Greenshades]
Control:   [control reference]
Status:    FAIL
Gap:       [what is missing]
Evidence path: [where to look]
Remediation:   [what to implement]
```

---

## STEP 5 — SENTINEL-ACCESS: Access Reviewer (quarterly / on anomaly)

Review IAM policies and RBAC configuration:

1. Audit all role definitions against principle of least privilege.
2. Check for over-permissioned service accounts.
3. Identify users/services with access to data they don't need.
4. Review access logs for anomalous patterns (off-hours, unusual volume, cross-tenant queries).

Output: Access review report + IAM remediation PRs for over-privileged roles.

---

## STEP 6 — SENTINEL-PENTEST: Automated Pen Tester (pre-release / quarterly)

Orchestrate automated penetration testing against staging:

Attack surface enumeration:
```bash
# Enumerate all API endpoints
find src/ -name "*.ts" | xargs grep -E "(app\.(get|post|put|delete|patch)|router\.(get|post|put|delete|patch))" 2>/dev/null
```

Execute against each surface:
- **OWASP Top 10 scenarios**: run automated checks for each category
- **Privilege escalation**: attempt to access Admin endpoints as Employee
- **Cross-tenant**: attempt to read/write Tenant B data as Tenant A user
- **Injection**: SQLi, command injection, template injection on all input vectors
- **CSRF**: cross-site request forgery on state-changing endpoints

CVSS-score each finding. Generate remediation backlog items.

**Pentest is against staging only. Never against production.**

---

## STEP 7 — SENTINEL-SBOM: Supply Chain / SBOM Agent (on release)

Generate and maintain Software Bill of Materials for the release:

1. List all components: direct dependencies + transitive dependencies.
2. Record: name, version, license, source URL, hash.
3. Verify provenance: confirm package hashes match published checksums.
4. Diff vs previous release SBOM — surface new dependencies.
5. Check all components against CISA Known Exploited Vulnerabilities catalog.

Output formats: SPDX 2.3 + CycloneDX 1.4

```
━━ SBOM SUMMARY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Components: [N] total ([N] direct, [N] transitive)
New vs last release: [N] added, [N] removed
Licenses: [list of license types]
KEV matches: [N] — CRITICAL if any
Supply chain risk: LOW / MEDIUM / HIGH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Save to: `specs/sentinel-sbom-v[version]-[YYYY-MM-DD].json`

---

## STEP 8 — SENTINEL-CHAOS: Chaos Engineering Agent (pre-release / bi-weekly)

**Staging environments only. Strict blast-radius analysis required before any experiment.**

Design and execute chaos experiments from the system topology:

Experiment catalog:
```
CHAOS-[N]: [Experiment Name]
Target:     [service or component]
Blast radius: [what might fail and for whom]
Safe-mode:  [conditions that auto-halt the experiment]
Hypothesis: "When [X] fails, [Y] should happen. If not, we found a gap."
Method:     [pod kill | network delay | CPU stress | DB failover | disk fill]
Duration:   [N] minutes
```

Execute and observe:
- Does the system degrade gracefully or fail hard?
- Do alerts fire within expected SLO windows?
- Does the auto-recovery mechanism work?
- Does the user experience degrade minimally (circuit breaker, fallback)?

```
CHAOS-[N] RESULT
Hypothesis:  [was it validated?] YES / NO
Observed:    [what actually happened]
Gap found:   [resilience gap if hypothesis failed]
Remediation: [what to add — circuit breaker, retry, fallback]
```

---

## SECURITY VERDICT

After all applicable sub-agents complete:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  SENTINEL — SECURITY & COMPLIANCE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:       [name]
Date:          [today]
Commit:        [hash]

━━ SCAN RESULTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAST:          [N] critical, [N] high, [N] medium, [N] low
Secrets:       [CLEAN | [N] found]
Dependencies:  [N] vulnerable, [N] auto-PRs generated
DAST:          [N] critical, [N] high, [N] medium, [N] low

━━ COMPLIANCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Greenshades:   [N/6 checks passed]
SOC2:          [N/N controls passed]
HIPAA:         [N/A | N/N controls passed]
PCI-DSS:       [N/A | N/N controls passed]

━━ CHAOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Experiments:   [N] run
Gaps found:    [N]
Resilience:    HIGH / MEDIUM / LOW

━━ VERDICT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ GO — No critical/high unresolved. Ready for CONDUCTOR.
  ❌ NO-GO — [N] critical/high unresolved. Return to FORGE.

Findings requiring fix before deploy:
  • SCAN-[N] (CRITICAL)
  • COMPLY-[N] (HIGH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Save to: `specs/sentinel-security-[feature]-[YYYY-MM-DD].md`

---

## HUMAN GATE — REQUIRED BEFORE CONDUCTOR

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️  SENTINEL → CONDUCTOR  HUMAN GATE                       │
│                                                              │
│  Security Report: specs/sentinel-security-[feature]-[date].md│
│                                                              │
│  Confirm before proceeding:                                  │
│  [ ] VERDICT = GO (all critical/high resolved)              │
│  [ ] SAST scan clean (0 critical, 0 high)                   │
│  [ ] Secrets scan clean                                      │
│  [ ] DAST scan complete on staging                          │
│  [ ] Greenshades compliance checklist all 6 passed          │
│  [ ] SBOM generated (if release)                            │
│  [ ] Security lead has signed off                           │
│                                                              │
│  next          → proceed to /conductor                      │
│  revise: [x]   → fix security finding, re-run SCAN         │
│  stop          → save state to progress.md, halt            │
└─────────────────────────────────────────────────────────────┘
```
