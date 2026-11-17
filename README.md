# Tap In

**Event registration with QR check-in — built entirely on Google's free tier.**

Tap In collects attendee registrations with a Google Form, writes them to a Google Sheet, gives each registration a secret `AttendeeID` and a QR code, emails the QR to the attendee, and lets operators check people in from a phone web page. Attendee PII stays in the Sheet; the QR carries only an opaque ID.

---

## 1. Project overview and tech stack

No paid services. The pipeline is:

**Google Form → Google Sheet → Apps Script (ID + QR + email) → web scanner → Sheet write-back.**

| Layer | Technology |
|---|---|
| Registration | Google Forms |
| Data store | Google Sheets (tab `Registrations`) |
| Backend / automation | Google Apps Script (`.gs`) |
| ID generation | `Utilities.getUuid()` |
| QR rendering | A small QR library placed in `/backend` (never a third-party QR website) |
| QR storage | Google Drive folder shared as "Anyone with the link can view" |
| Email | Gmail via `GmailApp`, from a verified "Send as" alias |
| Check-in client | Apps Script web app (HTML/CSS/JS) using `HtmlService` with `BarcodeDetector` |
| Collaboration | Git and pull requests; no member pushes to `main` |

`SPEC.md` is the product contract. `docs/BUILD_PROMPTS.md` holds one task prompt per member.

---

## 2. Prerequisites and setup

**What each member needs before starting**

- A Google account.
- Editor access to the shared Form, Sheet, and Script (granted by the project owner — no shared passwords).
- Git installed.
- Any AI tool (ChatGPT, Gemini, Claude, etc.). The AI cannot see this repo, so the prompts repeat everything it needs.
- A code editor.

The **project owner** is a separate role: they own the Form, Sheet, Apps Script, and the dummy Gmail account, and they configure the shared settings. Members are Editors on the files, not owners.

**Setup steps**

1. **Clone the repo** — `git clone <repo-url>` and then `cd tap-in`. Replace `<repo-url>` with the real URL the lead gives you.
2. **Create your branch** — `git checkout -b feature/task-<N>-<slug>` using the branch name in the table in section 5.
3. **Read `SPEC.md`** from top to bottom. It is the single source of truth for the data contract and the behavior.
4. **Open your one task in `docs/BUILD_PROMPTS.md`** (PART B) and follow only that prompt. Do not work on another member's task.

> **Secrets are never committed.** The scanner PIN lives in Apps Script → Project Settings → Script Properties under `SCANNER_PIN`. The sender alias and the dummy Gmail account belong to the project owner. Never commit a PIN, a password, a real sender address, or real attendee data to a file. Use placeholders such as `SENDER_ALIAS = "PASTE_LATER"`.

---

## 3. Command cheat sheet

The few commands you actually need:

```bash
git clone <repo-url>                      # get a local copy of the repo
cd tap-in                                 # enter the repo
git checkout -b feature/task-1-form       # create your task branch (use your own)
git status                                # see what you changed
git add .                                 # stage all changed files
git commit -m "Task 1: Registration Form" # save your work locally
git pull --rebase origin main             # stay current before pushing
git push -u origin feature/task-1-form    # publish your branch for review
```

`main` is protected: members push their own branches and open a PR. Only the team lead merges into `main`.

---

## 4. Team roles, branching, and merge order

| Order | Task | Member | Folder | Branch name |
|---|---|---|---|---|
| 1 | Registration Form | Member 1 | `/form` | `feature/task-1-form` |
| 2 | Backend: ID + QR | Member 2 | `/backend` | `feature/task-2-backend` |
| 3 | Email | Member 3 | `/email` | `feature/task-3-email` |
| 4 | Scanner | Member 4 | `/scanner` | `feature/task-4-scanner` |
| 5 | Lead/QA | Member 5 | `/docs` | `feature/task-5-qa` |

**Merge order:** Form → Backend → Email → Scanner → QA.

Members work **in parallel** in their own folder. Only the **team lead (Member 5)** merges into `main`. The project owner (who owns the Form, Sheet, Script, and dummy Gmail) is a separate role and does not merge code.

---

## 5. The handoff and PR process

1. **Finish your task** and run the verification test in your prompt. Do not move on until it passes.
2. **Write your handoff note** using the Z3 template into `docs/handoff/task-<N>.md`, then include the A2 Report from `docs/BUILD_PROMPTS.md`.
3. **Commit** your files and the note: `git add .` then `git commit -m "Task <N>: <short description>"`.
4. **Push your branch**: `git push -u origin feature/<task>`.
5. **Open a PR to `main`** and paste your A2 Report into the description.
6. **Wait for review.** Address BLOCKER findings from the Z2 review, then re-request review.
7. **Lead merges** the approved PR into `main` in the merge order above.
8. **Notify the next member** in the merge order that their task is unblocked.

---

## 6. AI guardrails

> **Do this first:** paste the Rules Block from `AI_RULES.md` (identical to A1 in `docs/BUILD_PROMPTS.md`) into a fresh AI chat. **Then** paste **only your one task prompt** from PART B. Never paste this whole file or all five prompts into the AI. The Rules Block must be pasted first so it governs everything that follows.

**Never let the AI:**

- Invent a function name, API, setting, column, or URL — it should say "I'm not sure" instead.
- Change the Sheet columns or their order, the form field order, the `AttendeeID` rule, or the QR-contains-only-the-ID rule.
- Write secrets or real attendee data into files.
- Touch files outside its `OWNED FILES` line, or continue past the `CHECKPOINT`.
- Skip the verification test or skip the A2 Report at the end.

If a step is unclear, the AI must stop and ask. If a setting or access item is missing, report it to the project owner or team lead rather than changing it yourself.

---

## 7. Folder structure

```text
tap-in/
├── README.md              # this file: setup, roles, process, help
├── SPEC.md                # product specification and the data contract
├── AI_RULES.md            # A1 Rules Block — paste into the AI first
├── OWNERS.md              # A4 ownership map: who may edit what
├── form/                  # Member 1: Form questions, field IDs, setup notes
├── backend/               # Member 2: Config.gs, Code.gs, QR library source
├── email/                 # Member 3: Email.gs and template.html
├── scanner/               # Member 4: index.html and the doGet.gs snippet
└── docs/                  # Member 5: specs, prompts, test log, go/no-go
    ├── BUILD_PROMPTS.md   # guardrails + one task prompt per member
    └── handoff/           # one Z3 handoff note per task
        └── README.md      # explains the notes and holds the Z3 template
```

---

## 8. Need help?

- **Setup, Google access, Sheet/Form/Script, Gmail alias, Script Properties, triggers, deployment, or Drive sharing** → the **project owner**.
- **Git conflicts, branch names, PRs, or merges** → the **team lead (Member 5)**.
- **"Am I allowed to edit this file?"** → `OWNERS.md` first; if still unclear, ask the team lead.
- **A bug or error during your task** → use the Z1 debugging prompt and Appendix D in `docs/BUILD_PROMPTS.md`. If the cause is a missing setting or access item, report it — do not fix it yourself.
