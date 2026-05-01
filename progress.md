# Greenshades AI Agent Pipeline — Progress Tracker
# Claude Code reads this at the start of every session.
# Update this file at the end of every session or agent run.

---

## CURRENT STATE

**Last Updated:** —
**Active Pipeline:** None — fresh start
**Last Agent Run:** None
**Last Agent Output:** None
**Next Action:** Run /iris with real customer feedback to start the pipeline

---

## PIPELINE STATUS

| Agent      | Status      | Output File                          | Date       |
|------------|-------------|--------------------------------------|------------|
| IRIS       | Not started | —                                    | —          |
| SAGE       | Not started | —                                    | —          |
| ATLAS      | Not started | —                                    | —          |
| FORGE      | Not started | —                                    | —          |
| SENTINEL   | Not started | —                                    | —          |
| CONDUCTOR  | Not started | —                                    | —          |
| GUARDIAN   | Not started | —                                    | —          |

---

## ACTIVE FEATURES

None yet. Start with /iris.

---

## COMPLETED FEATURES

None yet.

---

## DECISIONS LOG

| Date | Agent | Decision | Reason |
|------|-------|----------|--------|
| —    | —     | —        | —      |

---

## BLOCKERS

None.

---

## HOW TO USE THIS FILE

When an agent completes, update the Pipeline Status table:
- Change status to: Running / Gate / Complete / Blocked
- Add the output filename
- Add today's date

When human approves a gate, update:
- Previous agent → Complete
- Next agent → Running

When session ends mid-pipeline:
- Note exactly which agent was running
- Note what the next action is
- Claude Code picks up from here next session

---

## QUICK REFERENCE — GATE COMMANDS

| You type      | What happens                              |
|---------------|-------------------------------------------|
| next          | Approve gate, run next agent              |
| revise: [msg] | Revise current output, stay at same gate  |
| stop          | Save state here, end session              |
