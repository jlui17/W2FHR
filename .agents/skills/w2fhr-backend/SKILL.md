---
name: w2fhr-backend
description: W2FHR Go backend (src/GoogleSheets). Use when working on the Go Lambda backend, Google Sheets integration, availability/timesheet/scheduling handlers, refactoring backend code, or writing tests for backend packages.
---

# W2FHR Backend

Go backend running as AWS Lambda functions behind API Gateway. Single-repo with vendored dependencies.

## Quick Reference

- **Entry point**: `src/GoogleSheets/server.go` — Lambda handlers + local dev server
- **Packages**: `src/GoogleSheets/packages/` — 4 Lambda packages + shared utilities
- **Dep manager**: Vendored deps in `src/GoogleSheets/vendor/`
- **Run locally**: `src/GoogleSheets/run_local_server.sh`

## Patterns

### Package structure
Each Lambda package follows a 3-layer pattern:

```
packages/<name>/
├── main.go                    # Lambda entry: lambda.Start(handlers.HandleRequest)
└── handlers/
    ├── handler.go             # Auth extraction, HTTP routing, response marshaling
    ├── <Name>Types.go         # Public types (API-shaped, json-tagged) + private types
    ├── <Operation>.go         # Business logic / service layer (no HTTP concerns)
    └── <Sheet>.go             # Data access — Google Sheets API calls only
```

### Layers
1. **Handler** (`handler.go`) — extracts JWT → `EmployeeInfo`, routes by method, marshals responses. No business logic.
2. **Business** (`<Operation>.go`) — orchestrates data fetching, validation, transformation. No HTTP or Sheets API concerns.
3. **Data** (`<Sheet>.go`) — raw Google Sheets read/write. `Connect()` returns a struct with an injected `*sheets.Service`. No business rules.

### Shared packages
- `packages/common/GoogleClient` — singleton Sheets service client
- `packages/common/Constants` — shared constants, error sentinels, type helpers
- `packages/common/Utilities` — `EmployeeInfo` JWT parsing
- `packages/common/CognitoGroupAuthorizer` — role-based access (attendant/supervisor/manager)
- `packages/common/TimeUtil` — date parsing (Vancouver timezone)

### Dependencies
- Google Sheets API via `google.golang.org/api/sheets/v4`
- AWS Lambda via `github.com/aws/aws-lambda-go`
- Cognito JWT parsing via `github.com/golang-jwt/jwt/v5`

## Supplemental Docs

- **Unit testing philosophy and patterns**: See [references/unit-testing.md](references/unit-testing.md)
