# Handoff notes — Tap In

Each member writes one handoff note at the end of their task. Notes live here as `task-<N>.md` (for example `task-1.md`, `task-2.md`, …). They tell the next member and the reviewer what was built, how to verify it, and which contract checks passed — so work can move from one member to the next without a meeting.

Write your note from the **Z3 template** below, then include your full **A2 Report** from the AI at the bottom. Do not fill in another member's note, and do not add filled-in notes to this README — each task gets its own file.

Rules: report setup items that are missing; do not change them yourself. Do not write application code in a note.

## Z3 — Handoff note template

Copy this into `docs/handoff/task-<N>.md` and fill it in.

```text
# Handoff — Task <N>: <task name>

- Member: Member <N>
- Branch: feature/task-<N>-<slug>
- Folder / files: <folder> — <filenames>
- Date: <YYYY-MM-DD>

## What was built
<one short paragraph>

## How to verify
<the exact steps the next member or reviewer should run>

## Contract checks
- [ ] Columns A-J and order unchanged
- [ ] Form field order / AttendeeID rule / QR-only-ID rule respected (as applicable to this task)
- [ ] Function names and signatures exact (if this task defines them)
- [ ] SCANNER_PIN / SENDER_ALIAS / EVENT_TIMEZONE handled as specified (if applicable)
- [ ] No secrets or real attendee data in files

## Setup items needed from the project owner
<list, or "none"> — report missing items; do not change them yourself.

## Known issues / NOT verified
<list, or "none">

## A2 Report
<paste the full A2 Report from your AI here>
```
