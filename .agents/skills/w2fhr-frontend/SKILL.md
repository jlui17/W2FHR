---
name: w2fhr-frontend
description: W2FHR React frontend — scheduling app for shift workers. Covers architecture, patterns, and principles for working in this codebase.
---

# W2FHR Frontend

React single-page app for employee shift scheduling at Wun2Free. Employees submit availability; managers build schedules from templates.

## Stack

- **Runtime:** React 18, Vite 7, TypeScript (strict)
- **State:** TanStack React Query v5 for server state, React Context for auth session
- **Routing:** React Router v6 — 4 routes: `/` (login), `/signUp`, `/resetPassword`, `/dashboard`
- **Styling:** Tailwind CSS, shadcn/ui components (`src/components/ui/`)
- **Forms:** react-hook-form + zod validation
- **Testing:** Vitest + MSW + Testing Library (see `references/testing.md`)
- **Package manager:** pnpm

## Architecture

```
src/frontend/src/
├── components/
│   ├── Authentication/        # Login, signup, reset password, confirm account
│   ├── AuthenticationContextProvider.tsx  # Auth session via React Context
│   ├── AvailabilityForm/      # Employee submits availability for 4-day week
│   ├── Dashboard/             # Landing page after login, role-based widgets
│   ├── Timesheet/             # Employee view: upcoming/past shifts
│   ├── Schedule/              # Employee view: schedule for a date range
│   ├── NewSchedule/           # Manager: create new schedule from templates
│   ├── Scheduling/            # Manager: view availability, assign shifts
│   ├── UpcomingShifts/        # Dashboard widget
│   └── common/                # Shared: constants, URL builders, screen helpers
├── lib/utils.ts               # cn() classname utility
├── App.tsx                    # Route definitions
└── main.tsx                   # Entry point
```

## Patterns

### Feature structure

Every feature follows the same layout:

```
FeatureName/
├── FeatureController.tsx     # State wiring + data fetching
├── FeatureWidget.tsx         # Pure presentational component
├── helpers/
│   └── hooks.ts             # TanStack Query hooks, type guards, data converters
└── index.ts(x)              # Re-exports
```

### Controllers vs Widgets

- **Controller**: Connects hooks to the UI. Handles loading/error states, calls mutations, passes data down. No styling.
- **Widget**: Receives props, renders UI. No data fetching. Can be tested in isolation.

### TanStack Query hooks

All server data goes through custom hooks in `helpers/hooks.ts`. Every hook follows this pattern:

1. Type guard to validate API responses (`is*Data`)
2. `fetch` call with auth header (`Bearer ${idToken}`)
3. Switch on `response.status` — 200, 400, 401, 403, 404, 500
4. Wrap in `useQuery` or `useMutation` with explicit `queryKey`

### Auth

Auth session stored in `localStorage` via React Context (`AuthenticationContextProvider`). Tokens (idToken, refreshToken) managed client-side. `isAuthSession()` type guard validates shape on retrieval.

### API URLs

`constants.ts` switches base URL by environment:
- Development: `http://localhost:8080`
- Production: `https://q4q2yztd56.execute-api.us-west-2.amazonaws.com/v1`

## Principles

1. **Hooks over components for business logic** — data fetching, validation, and transformation live in hooks. Components are thin wrappers.
2. **Type guards at API boundaries** — every `response.json()` result validated with a type guard before use.
3. **Explicit error handling** — every HTTP status code handled explicitly with user-facing error messages.
4. **No prop drilling** — React Query for server state, Context for auth session.
5. **Test hooks, not components** — the hooks contain the logic. See `references/testing.md`.
6. **Don't modify `src/components/ui/`** — shadcn/ui components are library code.

## Supplemental Docs

- `references/testing.md` — testing strategy, what to test, patterns
