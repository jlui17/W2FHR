# W2FHR

HR scheduling app.

## Layout

- `src/frontend`: React/Vite/Tailwind frontend.
- `src/GoogleSheets`: Go Lambda API for Google Sheets.
- `lib`: AWS CDK infrastructure.

## Commands

- Use `pnpm`.
- Frontend dev: `pnpm dev`
- Frontend build: `pnpm build:frontend`
- Backend tests: `pnpm test`
- Full build: `pnpm build`

## Guidance

- Keep changes scoped to the relevant service.
- Prefer existing patterns over new abstractions.
- Do not edit vendored dependencies.
