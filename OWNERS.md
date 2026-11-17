# Ownership map — Tap In

Who owns each area, and whether others may edit it. The canonical copy of this table is A4 in `docs/BUILD_PROMPTS.md`.

| Area | Owner | Others may edit? |
|---|---|---|
| `/form` — Form questions, field IDs, setup notes | Member 1 | No |
| `/backend` — Config.gs, Code.gs, QR library | Member 2 | No |
| `/email` — Email.gs, template.html | Member 3 | No |
| `/scanner` — index.html, doGet.gs snippet | Member 4 | No |
| `/docs` — SPEC.md, prompts, test log, go/no-go | Member 5 (Lead/QA) | No |
| Form, Sheet, Script, dummy Gmail, Script Properties, triggers, deployment, Drive sharing | Project owner | No — Members are Editors on files only; only the owner configures settings |
| `main` branch merges | Member 5 (Lead/QA) | No — members push branches and open PRs |

The project owner is a separate role: they own the Form, Sheet, Script, and dummy Gmail and configure all shared settings. Members are Editors on the files, not owners, and only Member 5 merges into `main`.
