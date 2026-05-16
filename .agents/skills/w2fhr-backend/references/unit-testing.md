# Unit Testing Philosophy

## What to test

**Test business logic.** A function is business logic if it takes data in, transforms or filters it, and returns data out.

**Skip passthroughs.** A function that only calls another function and returns its result is a passthrough. The callee should be tested instead.

### How to identify testable code

When reading a file, ask:

1. Does this function call `Connect()` or use `*sheets.Service`? → Not testable as-is. See refactoring patterns below.
2. Does this function only call another function and return? → Skip it.
3. Does this function take plain data (strings, structs, slices) and return plain data? → Test it.
4. Does this function validate, transform, map, filter, or compute from inputs? → Test it.

### What to skip

- **Handler entry points** (`handler.go`) — auth extraction, HTTP routing, response marshaling. Integration concern.
- **`Connect()` functions** — just instantiate a struct. No logic.
- **`New()` functions for external services** — wiring, not logic.
- **Functions whose only job is calling a data layer method and returning** — the data layer method's behavior is the integration concern.

## How to make code testable

### Principle: separate extraction from logic

Code that mixes data fetching (calling Sheets API) with data transformation is hard to test. Split it:

1. One function extracts raw data from the external source (no logic, no test needed)
2. Another function takes plain data and does the transformation (pure logic, test this)

**Before — untestable:**
```go
func GetSomeData() (Result, error) {
    sheet, _ := Connect()
    resp, _ := sheet.fetchRawData()
    // transformation mixed with fetching
    result := transformTheData(resp)
    return result, nil
}
```

**After — separated:**
```go
// Trivial — no test needed
func GetSomeData() (Result, error) {
    sheet, _ := Connect()
    raw, _ := sheet.fetchRawData()
    return buildResult(raw), nil
}

// Pure logic — test this
func buildResult(raw RawData) Result {
    // all transformation logic here
}
```

### Principle: functions accept plain types, not framework types

When a function takes `*sheets.ValueRange`, `*sheets.BatchGetValuesResponse`, or `events.APIGatewayProxyRequest`, it's coupled to a framework and hard to construct in tests.

**Solution:** Extract the data into plain Go types first (slices, maps, structs), then pass those to the logic function.

**Before:**
```go
func process(resp *sheets.BatchGetValuesResponse) Result {
    // mixed extraction + logic
}
```

**After:**
```go
// Extraction — trivial
func (s *sheet) extractData(resp *sheets.BatchGetValuesResponse) ([]string, [][]string) {
    return SharedConstants.DToStrArr(resp.ValueRanges[0].Values[0]),
           SharedConstants.DDToStrArr(resp.ValueRanges[1].Values)
}

// Logic — testable
func buildFromData(dates []string, rows [][]string) Result {
    // pure transformation
}
```

### Principle: no singletons in business logic

Business logic functions should not call `GoogleClient.New()` or reach into package-level globals. They should receive everything they need as parameters.

## Process for adding tests

1. **Identify** testable business logic by reading the code with the rules above
2. **Refactor** to extract pure functions from impure ones — no logic changes, just structural
3. **Write table-driven tests** for the extracted pure functions
4. Commit the refactor as one commit, tests as a follow-up

## Test style

- **Table-driven** with `t.Run` for each case
- One test function per behavior being tested
- Cover edge cases: empty inputs, boundaries, malformed data, unexpected values
- Use `reflect.DeepEqual` for struct/slice comparisons (consistent with existing codebase)
- Test files live next to source: `foo.go` → `foo_test.go`
- Naming: `Test<FunctionName>` for direct tests, `Test<FunctionName>_<Scenario>` for specific behaviors
