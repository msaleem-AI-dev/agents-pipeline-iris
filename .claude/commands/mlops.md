# /mlops — MLOPS Agent Group (ML & Data Operations)
# AIDLC 10/10 | Group 9 of 9 | 5 Sub-Agents — NEW GROUP
# Greenshades AI Agent Pipeline
#
# Usage: /mlops <mode> [model name or feature name]
# Modes: train | eval | deploy | drift | datacheck

---

## ROLE
MLOPS handles the complete ML lifecycle — data quality, model training, evaluation,
deployment, and drift monitoring. It activates when features have ML/AI components.

MLOPS runs as a PARALLEL TRACK alongside the main pipeline for ML features:
  SAGE-MLARCH produces the ML architecture spec →
  FORGE-DATAPIPELINE builds the data pipelines →
  MLOPS-DATAQUALIFY → MLOPS-TRAIN → MLOPS-EVAL → MLOPS-DEPLOY →
  MLOPS-DRIFT (continuous, runs forever alongside GUARDIAN)

For non-ML features: MLOPS is not invoked.

---

## SUB-AGENTS

| Sub-Agent           | Role                        | Trigger                                   |
|---------------------|-----------------------------|-------------------------------------------|
| MLOPS-DATAQUALIFY   | Data quality guardian       | Continuous pipeline monitoring / post-ETL |
| MLOPS-TRAIN         | Model training orchestrator | Data quality gate pass / manual request   |
| MLOPS-EVAL          | Model evaluator             | MLOPS-TRAIN completion                    |
| MLOPS-DEPLOY        | Model deployment agent      | MLOPS-EVAL promote signal                 |
| MLOPS-DRIFT         | Model drift detector        | Continuous (always on) / GUARDIAN-MONITOR |

---

## PRE-FLIGHT

Confirm the following before running MLOPS:
1. SAGE-MLARCH section exists in `specs/sage-architecture-[feature]-[latest].md`
2. FORGE-DATAPIPELINE has built the required data pipelines

If ML architecture is missing → respond: "MLOPS requires SAGE-MLARCH design. Run /sage first and ensure ML architecture is included."

---

## STEP 1 — MLOPS-DATAQUALIFY: Data Quality Guardian

Continuously monitor data pipelines before data reaches any model.

### 1A — Schema Monitoring
For each data feed defined in the SAGE-MLARCH data contracts:
- Check schema matches the contract (field names, types, nullability)
- Flag schema drift: new columns, dropped columns, type changes
- Block training if schema drift detected — do not train on bad schema

### 1B — Statistical Quality Checks
Run these checks after every ETL / data pipeline run:

```python
# For each feature column in the training dataset:
quality_checks = {
    "null_rate":        "< [threshold from contract]",
    "cardinality":      "within expected range",
    "distribution":     "not statistically different from baseline (KS test p > 0.05)",
    "freshness":        "data age < [SLA from contract]",
    "anomalous_values": "no values outside [N] standard deviations of mean",
}
```

### 1C — Referential Integrity
- Verify join keys between tables have no orphans above threshold
- Verify foreign key relationships hold in data used for training

### 1D — Quality Report
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 MLOPS-DATAQUALIFY — DATA QUALITY REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline:    [data pipeline name]
Run date:    [today]
Rows:        [N] records checked

Schema:      PASS / DRIFT DETECTED
  [column]: [expected type] → [actual type] ← DRIFT

Quality gate results:
| Check             | Status | Detail                     |
|-------------------|--------|---------------------------|
| Null rate         | PASS   | Max [N]% (target <[N]%)   |
| Distribution      | PASS   | No significant shift       |
| Freshness         | PASS   | [N] hours old (SLA: <[N]h) |
| Anomalous values  | FAIL   | [N] outliers quarantined   |

Quarantined records: [N] rows — not included in training dataset.

GATE: GO / NO-GO (NO-GO if schema drift or critical quality failure)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Save to: `specs/mlops-dataquality-[model]-[YYYY-MM-DD].md`

---

## STEP 2 — MLOPS-TRAIN: Model Training Orchestrator

Orchestrate ML model training runs after data quality gate passes.

### 2A — Training Job Setup
From SAGE-MLARCH training pipeline design:
```python
# Training configuration (Kubeflow / SageMaker / Vertex AI)
training_config = {
    "model_type":     "[algorithm from SAGE-MLARCH]",
    "framework":      "[sklearn | tensorflow | pytorch | xgboost]",
    "compute":        "[instance type — optimize for cost vs speed]",
    "data_source":    "[feature store / data contract output]",
    "train_split":    0.70,
    "val_split":      0.15,
    "test_split":     0.15,
    "random_seed":    42,   # reproducibility
}
```

### 2B — Experiment Tracking
Log all runs to MLflow / W&B / SageMaker Experiments:
- Hyperparameters used
- Training metrics (loss per epoch, validation score)
- Training duration and compute cost
- Model artifact with version tag and git commit hash

### 2C — Hyperparameter Tuning
Run automated HPO using Optuna / Ray Tune if budget allows:
- Define search space from SAGE-MLARCH spec
- Set max trials (balance cost vs improvement)
- Report best configuration found

### 2D — Training Report
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 MLOPS-TRAIN — TRAINING REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model:           [name] v[version]
Run date:        [today]
Experiment ID:   [MLflow/W&B run ID]
Commit:          [git hash]

Training data:   [N] rows ([N] train / [N] val / [N] test)
Algorithm:       [name]
Framework:       [name] v[version]
Compute:         [instance type] — [N] hours — ~$[N]

Best hyperparameters:
  [param]: [value]
  [param]: [value]

Training metrics:
  Final training loss:    [N]
  Final validation loss:  [N]
  Best epoch:             [N]

Artifact:        [model registry path]
Status:          Ready for MLOPS-EVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 3 — MLOPS-EVAL: Model Evaluator

Evaluate trained models before any production deployment.

### 3A — Business Metric Evaluation
Evaluate on the holdout test set using metrics from SAGE-MLARCH:
```python
# Metrics defined in SAGE-MLARCH spec:
evaluation_metrics = {
    "accuracy":   "[target from spec]",
    "precision":  "[target]",
    "recall":     "[target]",   # often more important than precision for Greenshades
    "f1_score":   "[target]",
    "auc_roc":    "[target]",
    # Custom business metric (e.g. "false negative rate on payroll errors < 0.1%")
}
```

### 3B — Fairness & Bias Analysis
For each protected attribute (if applicable):
- Demographic parity: does the model perform equally across groups?
- Equalized odds: are error rates similar across groups?
- Individual fairness: similar individuals get similar predictions?

Flag any fairness gap >5% between groups as HIGH risk.

### 3C — Adversarial Robustness
- Test with near-boundary inputs
- Test with noisy/corrupted inputs
- Test with inputs designed to fool the model
- Document failure modes

### 3D — Comparison vs Current Production Model (if replacing)
```
| Metric     | Challenger | Champion (prod) | Delta  |
|------------|------------|-----------------|--------|
| Accuracy   | [N]%       | [N]%            | +[N]%  |
| Recall     | [N]%       | [N]%            | +[N]%  |
| Latency    | [N]ms      | [N]ms           | +[N]ms |
```

### 3E — Model Card
```markdown
# Model Card: [Model Name] v[version]
Date: [today]
Task: [classification | regression | ranking | NLP]
Training data: [date range, source, size]
Framework: [name + version]

## Performance
[Metric table from 3A]

## Fairness
[Results from 3B]

## Known Limitations
[What this model does not handle well]

## Intended Use
[What it should be used for in Greenshades]

## Out-of-Scope Use
[What it should NOT be used for]
```

### 3F — Promote / Reject Recommendation
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MLOPS-EVAL — EVALUATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model:        [name] v[version]
Test set:     [N] samples

Metrics vs targets:
  [metric]: [value] / [target] → PASS/FAIL

Fairness:     PASS / FAIL — [details if fail]
Adversarial:  PASS / FAIL — [failure modes found]
Vs champion:  BETTER / WORSE / EQUIVALENT on [primary metric]

RECOMMENDATION:
  ✅ PROMOTE — metrics met, fairness passed. Ready for MLOPS-DEPLOY.
  ❌ REJECT  — [reason]. Retrain with [specific fix].
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Save to: `specs/mlops-eval-[model]-[YYYY-MM-DD].md`

**Human gate: show PROMOTE recommendation and wait for human sign-off before deploying.**

---

## STEP 4 — MLOPS-DEPLOY: Model Deployment Agent

Manage safe rollout of ML models to production.

### 4A — Shadow Mode (optional for high-risk models)
Deploy new model alongside current — run both, compare outputs, don't use new model's predictions yet.
Monitor for [N] days, compare prediction distributions.

### 4B — Canary Deployment
Route [5%] of traffic to new model. Monitor for [N] hours:
- Prediction latency: must be within [N]ms of champion
- Prediction confidence distribution: must match expected shape
- Business metric impact (if ground truth available quickly): neutral or positive

If canary healthy → 25% → 50% → 100%.
If canary fails → automatic rollback to champion.

### 4C — Serving Infrastructure
From SAGE-MLARCH serving architecture:
- Online serving: REST endpoint (FastAPI / TorchServe / SageMaker endpoint)
- Batch serving: scheduled job writing predictions to DB
- Multi-model routing: A/B test assignment if running experiments

### 4D — Health Monitoring Setup
Configure model endpoint monitoring:
- Prediction latency: alert if p95 > [N]ms
- Prediction volume: alert if drops >30% (potential upstream issue)
- Prediction distribution: alert if output distribution shifts significantly

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 MLOPS-DEPLOY — DEPLOYMENT RECORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model:          [name] v[version]
Deploy date:    [today]
Strategy:       [shadow | canary | direct]
Endpoint:       [URL or batch job name]
Traffic:        [N]% (canary) / 100% (full)
Champion model: [still running at [N]% | decommissioned]
Rollback:       v[prev-version] ready in model registry
Status:         LIVE ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Human must confirm before any production ML deployment.**

---

## STEP 5 — MLOPS-DRIFT: Model Drift Detector (continuous)

Always-on monitoring of production models. Runs alongside GUARDIAN-MONITOR.

### 5A — Input Feature Drift
Compare the distribution of incoming prediction requests vs the training distribution:
- For each feature: run KS test or PSI (Population Stability Index)
- PSI < 0.1: stable | 0.1–0.2: warning | >0.2: significant drift → alert

### 5B — Prediction Drift
Monitor the distribution of model outputs:
- Is the model predicting the same class/range as before?
- Sudden shift in output distribution = data drift or upstream data change

### 5C — Performance Drift (when ground truth available)
When labels become available (e.g., payroll processed = ground truth for payroll prediction):
- Compare live predictions to actuals
- Alert if accuracy degrades more than [N]% vs baseline

### 5D — Retraining Trigger
Automatically propose retraining when:
- PSI > 0.2 for 3+ input features
- Prediction drift sustained for [N] days
- Performance degradation > [N]% vs baseline

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 MLOPS-DRIFT — DRIFT ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model:       [name] v[version]
Alert date:  [today]
Type:        INPUT DRIFT / PREDICTION DRIFT / PERFORMANCE DRIFT

Drift evidence:
  Feature [name]: PSI = [N] (threshold: 0.2) — SIGNIFICANT
  Feature [name]: PSI = [N] — STABLE

Prediction distribution: [unchanged | shifted by [N]%]
Performance vs baseline:  [N]% accuracy (baseline: [N]%) — DEGRADED

Recommendation:
  ACTION: Retrain immediately / Monitor / No action
  Trigger: /mlops train [model-name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Drift alerts feed into GUARDIAN-MONITOR for unified incident management.

---

## HUMAN GATE — BEFORE MLOPS-DEPLOY

```
┌─────────────────────────────────────────────────────────┐
│  🤖 MLOPS → PRODUCTION  HUMAN GATE                      │
│                                                          │
│  Eval Report: specs/mlops-eval-[model]-[date].md        │
│                                                          │
│  Confirm before deploying model to production:           │
│  [ ] MLOPS-EVAL recommendation = PROMOTE                │
│  [ ] All evaluation metric targets met                  │
│  [ ] Fairness analysis passed                           │
│  [ ] Model card reviewed and approved                   │
│  [ ] Data quality gate passed for training data         │
│  [ ] Rollback model version ready in registry           │
│  [ ] Serving infrastructure capacity confirmed          │
│                                                          │
│  next          → deploy model to production             │
│  revise: [x]   → retrain with specific changes         │
│  stop          → save state to progress.md, halt        │
└─────────────────────────────────────────────────────────┘
```
