# Unit Testing Philosophy

## What to test

**Test business logic.** If a function takes data in, transforms or filters it, and returns data out — test it.

**Skip passthroughs.** Functions that only call another function and return its result don't need tests. The callee should be tested.

### Examples (from this codebase)

**Should test:**
- `makeScheduledEmployeesMap` — takes `[]ExternalShift`, builds a de-duplicated date→employee map. Pure data transformation.
- `validateNewScheduleRequest` — takes a request struct, runs regex/range validation, returns errors. Pure validation logic.
- `getEmployeesAvailablePerDay` — takes raw sheet data + positions, builds sorted per-day availability. Data extraction.
- `getPositionPriority` — maps position strings to sort order. Pure function, no deps.
- `convertNewScheduleRequestToInternal` — maps API-shaped structs to internal structs. Type conversion with date parsing.
- `createAvailability` — takes raw sheet values, builds a typed struct. Data mapping.
- `getStartAndEndDates` — parses date strings, validates ordering. Input validation.
- `normalizeString` — string transformation. Pure function.
- `All2DArraysSameLength` — generic validation helper. Pure function.

**Should NOT test:**
- `Get()` in `GetAvailability.go` — just calls `Connect()` then `sheet.Get()`. No transformation.
- `Update()` in `UpdateAvailability.go` — just calls `Connect()` then `sheet.Update()`. Passthrough.
- `HandleRequest` in any `handler.go` — HTTP routing and auth plumbing. Integration concern.
- `New()` in `GoogleClient` — external service connection. Integration concern.
- `Connect()` on any sheet type — just instantiation. No logic.

## How to make code testable

### Problem: Singleton dependencies

The data layer (`AvailabilitySheet.go`, `Timesheet.go`) is coupled to `GoogleClient.New()` — a package-level singleton. Testing these functions requires a real Google Sheets connection.

**Solution:** Business logic functions should NOT call `Connect()` or accept `*sheets.Service`. They should take plain data (structs, slices, maps). The data layer calls are kept in separate functions that are trivial passthroughs.

**Bad** (business logic intertwined with data fetching):
```go
func GetSchedulingData() (Data, error) {
    sheet, _ := Connect()
    resp, _ := sheet.GetData()
    // business logic mixing with API calls
    return transformData(resp), nil
}
```

**Good** (separate concerns):
```go
// Data fetching — trivial, no test needed
func GetSchedulingData() (Data, error) {
    sheet, _ := Connect()
    raw, _ := sheet.GetData()
    return buildSchedulingData(raw), nil
}

// Business logic — pure, testable
func buildSchedulingData(raw RawSheetData) Data {
    // all transformation logic here
}
```

### Problem: Functions accept concrete types from other packages

When a function takes `sheets.ValueRange` or `events.APIGatewayProxyRequest`, it's coupled to those packages and hard to construct in tests.

**Solution:** Extract the data from the external type first, then pass plain values to the logic function. The extraction function is trivial (no test needed). The logic function is pure (easily tested).

**Before:**
```go
func process(response *sheets.BatchGetValuesResponse) Result {
    // mixes extraction and logic
}
```

**After:**
```go
func extractFromResponse(resp *sheets.BatchGetValuesResponse) ([][]string, []string) {
    // trivial extraction — no test needed
}

func buildResult(data [][]string, dates []string) Result {
    // pure logic — test this
}
```

## Process

1. **Identify** all testable business logic functions in the codebase
2. **Refactor** to separate data fetching from business logic — no logic changes, just extract pure functions
3. **Write table-driven tests** for the extracted pure functions
4. Commit the refactor separately from the tests

## Test style

- Table-driven tests using `t.Run`
- One test function per behavior, multiple cases via table
- Test edge cases: empty inputs, boundary values, malformed data
- Use `reflect.DeepEqual` for struct/slice comparison (same as existing tests)
- Test files next to source: `foo.go` → `foo_test.go`
