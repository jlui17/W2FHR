---
name: w2fhr-backend
description: W2FHR Go backend (src/GoogleSheets). Use when working on the Go Lambda backend, Google Sheets integration, availability/timesheet/scheduling handlers, refactoring backend code, or writing tests for backend packages.
---

# W2FHR Backend

Go backend running as AWS Lambda functions behind API Gateway. Single-repo with vendored dependencies.

## Layout

- `src/GoogleSheets/server.go` — Lambda handlers + local dev server
- `src/GoogleSheets/packages/` — Lambda packages + shared utilities
- `src/GoogleSheets/vendor/` — vendored Go dependencies
- `src/GoogleSheets/run_local_server.sh` — local dev script

## Architecture

### 3-Layer Pattern

Every Lambda package follows this structure. Read the code to find exact file names — they follow these conventions.

```
packages/<name>/
├── main.go                          # lambda.Start(handlers.HandleRequest)
└── handlers/
    ├── handler.go                   # Auth extraction, HTTP routing, response marshaling
    ├── <Name>Types.go               # Public types (json-tagged) + private types
    ├── <Operation>.go               # Business logic — no HTTP, no Sheets API
    └── <Sheet>.go                   # Data access — Google Sheets calls only
```

**Rules for each layer:**

| Layer | File convention | Do | Don't |
|-------|----------------|-----|-------|
| Handler | `handler.go` | Extract JWT → EmployeeInfo, route by HTTP method, marshal responses, set status codes | No business logic, no Sheets API calls |
| Business | `<Operation>.go` (e.g. `GetFoo.go`, `PostBar.go`) | Validation, data transformation, orchestration | No HTTP concerns, no `*sheets.Service` |
| Data | `<Sheet>.go` | Google Sheets read/write via `*sheets.Service`. Exposes `Connect()` | No business rules, no auth decisions |

### Shared Packages

All under `packages/common/`. Read the code to understand each — conventions:

- **GoogleClient** — Singleton `*sheets.Service`. Never import this from business layer code.
- **Constants** — Shared error sentinels, header maps, type conversion helpers.
- **Utilities** — JWT parsing → `EmployeeInfo` struct (email, id, group, availability row).
- **CognitoGroupAuthorizer** — Integer-level role checks. Configurable minimum level.
- **TimeUtil** — Date string parsing in Vancouver timezone. Handles two formats (schedule dates, API dates).

### Key Dependencies

- `google.golang.org/api/sheets/v4` — Google Sheets API
- `github.com/aws/aws-lambda-go` — Lambda events and handler interface
- `github.com/golang-jwt/jwt/v5` — Cognito JWT parsing

## Supplemental Docs

- **Unit testing**: [references/unit-testing.md](references/unit-testing.md) — philosophy, what to test, how to refactor for testability
