# Frontend Testing

## Strategy

**Option 2: Unit tests (pure functions) + Hook tests (MSW-mocked API)**

Test the functional logic — the hooks, type guards, data converters, and utility functions that contain the actual business rules. Don't test UI rendering or library components.

## What to test

| Layer | Examples | Why |
|---|---|---|
| **Type guards** | `isAuthSession`, `isTimesheetData`, `isSchedulingDataFromAPI` | API contract validators — catch malformed responses |
| **Data converters** | `convertSchedulingDataFromAPI`, `convertTimesheetDataToScheduleData`, `dateToFormatForApi` | Transformation bugs (dates, timezones, Sets vs arrays) |
| **Template generators** | `getGamesTemplate`, `getWWTemplate`, `getBlankTemplate` | Array index math edge cases |
| **TanStack Query hooks** | `useLogin`, `useTimesheetData`, `useSchedulingData`, `usePostNewSchedule` | API interaction — happy path + 400/401/403/404/500 + malformed data |
| **URL builders** | `getTimesheetApiUrlForEmployee`, `getScheduleForTimeRangeApiUrl` | Query parameter correctness |
| **Auth context** | `AuthenticationContextProvider` — save/load session, logout, feature flags | Session lifecycle |

## What NOT to test

| Layer | Why not |
|---|---|
| `src/components/ui/**` | shadcn/ui — tested upstream |
| `cn()` utility | Delegates to clsx + tailwind-merge — tested upstream |
| Component render output | Thin react-hook-form + shadcn wrappers. Visual regressions belong in E2E/manual review. |
| E2E flows | Overkill for this app size. Add later if flaky deploys become a problem. |

## Test patterns

### Pure function test

```ts
import { describe, it, expect } from 'vitest'

describe('functionName', () => {
  it('happy path', () => {
    expect(fn(validInput)).toEqual(expectedOutput)
  })
  it('edge case: null input', () => {
    expect(fn(null)).toBe(false) // or throw
  })
})
```

### Hook test (with MSW)

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'

// Create a QueryClient wrapper with retry: false
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

describe('useDataHook', () => {
  afterEach(() => queryClient.clear())

  it('happy path', async () => {
    server.use(http.get(`${BASE}/endpoint`, () =>
      HttpResponse.json(validData, { status: 200 })
    ))
    const { result } = renderHook(() => useDataHook(params), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('error: 404', async () => {
    server.use(http.get(`${BASE}/endpoint`, () =>
      HttpResponse.text('Not found', { status: 404 })
    ))
    const { result } = renderHook(() => useDataHook(params), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('error: malformed data (200 with invalid body)', async () => {
    server.use(http.get(`${BASE}/endpoint`, () =>
      HttpResponse.json({ invalid: true }, { status: 200 })
    ))
    const { result } = renderHook(() => useDataHook(params), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
```

### Mutation test

```ts
it('calls onSuccess on 200', async () => {
  server.use(http.post(`${BASE}/endpoint`, () =>
    new HttpResponse(null, { status: 200 })
  ))
  const onSuccess = vi.fn()
  const onError = vi.fn()
  const { result } = renderHook(() => useMutation({ onSuccess, onError }), { wrapper })

  result.current.mutate(payload)

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
```

## Principles

1. **Every API response path gets a test** — 200 (valid), 200 (malformed), 400, 401, 403, 404, 500
2. **Assert both callbacks in mutations** — `onSuccess` was called AND `onError` was not (and vice versa)
3. **Use `renderHook`, not `render`** — hooks are tested in isolation
4. **MSW over mocks** — intercept at the network level so hooks work naturally
5. **`retry: false` always** — tests should fail fast, not retry
6. **`BASE = 'http://localhost:8080'`** — vitest config sets `MODE=development` so hooks use localhost URLs
7. **No weak assertions** — never `if (x) { expect(x.y).toBe(z) }`. Assert existence first: `expect(x).toBeDefined()`
8. **Test files mirror source location** — `src/components/Foo/helpers/__tests__/hooks.test.ts`

## Test file checklist

When writing a new hook test, verify:
- [ ] Happy path: 200 with valid response
- [ ] Malformed data: 200 with invalid response body
- [ ] Not found: 404
- [ ] Forbidden/disabled: 403 (if applicable)
- [ ] Server error: 500 (or default case)
- [ ] `enabled` flag: doesn't fetch when disabled (if applicable)
- [ ] Mutation callbacks: onSuccess + onError cross-assertions
- [ ] QueryClient cleared in `afterEach`
- [ ] MSW handler matches exact API URL and method
