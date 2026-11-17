# Ownership map — Tap In

Who owns each area, and whether others may edit it. The canonical copy of this table is A4 in `docs/BUILD_PROMPTS.md`.

| Area | Owner | Others may edit? |
|---|---|---|
| `/form` — Form questions and setup notes (the Form itself already exists) | Member 1 | No |
| `/backend` — Config.gs, Code.gs, QR library | Member 2 | No |
| `/email` — Email.gs, template.html | Member 3 | No |
| `/scanner` — index.html, doGet.gs snippet | Member 4 | No |
| `/docs` — SPEC.md, prompts, test log, go/no-go | Member 5 (Lead/QA) | No |
| Form, Sheet, Script container, dummy Gmail, Script Properties (`SCANNER_PIN`), Gmail alias, QR Drive folder | Project owner | No — Members are Editors on files only; only the owner configures settings |
| `onFormSubmit` trigger install (after Member 2's code is merged) | Project owner | No — installable triggers run as the installer |
| Web app deployment (after Member 4's code is merged) | Project owner | No — "Execute as: Me" must be the owner |
| `main` branch merges | Member 5 (Lead/QA) | No — members push branches and open PRs |

The project owner is a separate role: they own the Form, Sheet, Script, and dummy Gmail and configure all shared settings. Members are Editors on the files, not owners, and only Member 5 merges into `main`. The owner completed the initial setup before members started; they install the `onFormSubmit` trigger after Member 2's code is merged and deploy the web app after Member 4's code is merged.
