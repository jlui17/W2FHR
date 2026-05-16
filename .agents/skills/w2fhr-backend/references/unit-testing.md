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

## The Google Sheets conversion pattern

When writing to Google Sheets, follow this 3-step pattern:

1. **Call an update method** with nice readable Go types (structs, `time.Time`, `bool`)
2. **Convert** those nice types into Google Sheets' expected format (`*sheets.ValueRange` with `[][]interface{}`)
3. **Call the Sheets API** dependency

**Step 2 must be tested.** Don't mock the Sheets API. Instead, verify the conversion produces correct `*sheets.ValueRange` / `[][]interface{}` output for given inputs.

**Example: `translateShiftsToGoogleSheets`**
```go
// Takes domain type, returns Sheets API type — test this
func translateShiftsToGoogleSheets(shifts []InternalShift) *sheets.ValueRange {
    var res = make([][]interface{}, len(shifts))
    for i, shift := range shifts {
        res[i] = []interface{}{
            shift.ShiftTitle,
            shift.Employee,
            shift.Date.Format(TimeUtil.ScheduleDateFormat),
            shift.StartTime,
            shift.EndTime,
            shift.BreakDuration,
            shift.Designation,
            shift.LastUpdated,
        }
    }
    return &sheets.ValueRange{Values: res}
}
```

Tests for this verify:
- Empty input → empty ValueRange
- Single/multiple shifts → correct column order and row count
- `time.Time` date → correct string format

**What counts as a conversion function:**
- Domain type → `*sheets.ValueRange` (e.g. `translateShiftsToGoogleSheets`)
- API request → domain type (e.g. `convertNewScheduleRequestToInternal`)
- Raw `[]interface{}` → typed Go structs (e.g. `createAvailability`, `DToStrArr`, `DDToStrArr`)
- Domain values → A1 notation range strings (e.g. `putScheduleRange`, `availabilityRange`)
- Validation with regex (e.g. `validateNewScheduleRequest`)

## Process for adding tests

1. **Identify** testable business logic by reading the code with the rules above
2. **Refactor** to extract pure functions from impure ones — no logic changes, just structural
3. **Write table-driven tests** for the extracted pure functions
4. Commit the refactor as one commit, tests as a follow-up

## Reducing boilerplate with parameterized tests

When the same test structure repeats >3 times with only field values changing, collapse into a single parameterized table. This is not about Go generics or code generation — it's about recognizing when separate test functions are really one test with different inputs.

### When to parameterize

**Collapse when the test body is identical and only the test case data changes.** The hallmark: you copy-pasted a test function, changed one or two values, and left everything else the same.

**Keep separate when the test setup or assertion logic differs.** If tests for two different fields require fundamentally different setup or assertions, they're different behaviors.

### Example: Validation error tests

Six separate test functions testing validation of different fields, each with the same structure:

**Before (65+ lines of repeated boilerplate):**
```go
func TestValidateNewScheduleRequest_InvalidEmployee(t *testing.T) {
    testCases := []struct {
        name     string
        employee string
    }{
        {"Missing Parenthesis", "John Smith 123"},
        {"Empty Employee", ""},
        {"Only Name", "John Smith"},
        {"Only ID", "(123)"},
    }
    for _, tc := range testCases {
        t.Run(tc.name, func(t *testing.T) {
            request := NewScheduleRequest{
                Shifts: []NewScheduleShift{{
                    ShiftTitle: "Morning Shift",
                    Employee: tc.employee, Date: "2025-05-04",
                    StartTime: "09:00", EndTime: "17:00",
                    BreakDuration: "00:30:00", Designation: "Games",
                }},
            }
            err := validateNewScheduleRequest(request)
            if err == nil {
                t.Errorf("Expected error for invalid employee format '%s', but got none", tc.employee)
            }
        })
    }
}
// ... then 5 more functions just like it for Date, StartTime, EndTime, etc.
```

**After (single table, ~50 lines total):**
```go
func TestValidateNewScheduleRequest_InvalidFields(t *testing.T) {
    validShift := NewScheduleShift{
        ShiftTitle: "Morning Shift", Employee: "John Smith (123)",
        Date: "2025-05-04", StartTime: "09:00", EndTime: "17:00",
        BreakDuration: "00:30:00", Designation: "Games",
    }

    tests := []struct {
        name       string
        mutate     func(*NewScheduleShift)
        invalidVal string // for the error message
    }{
        {"Missing parenthesis in employee",
            func(s *NewScheduleShift) { s.Employee = "John Smith 123" }, "John Smith 123"},
        {"Empty employee",
            func(s *NewScheduleShift) { s.Employee = "" }, ""},
        {"Only name, no ID",
            func(s *NewScheduleShift) { s.Employee = "John Smith" }, "John Smith"},
        {"Invalid date format MM/DD/YYYY",
            func(s *NewScheduleShift) { s.Date = "05/04/2025" }, "05/04/2025"},
        {"Invalid month 13",
            func(s *NewScheduleShift) { s.Date = "2025-13-04" }, "2025-13-04"},
        {"Empty date",
            func(s *NewScheduleShift) { s.Date = "" }, ""},
        {"Start time with AM/PM",
            func(s *NewScheduleShift) { s.StartTime = "9:00 AM" }, "9:00 AM"},
        {"Start time out of range",
            func(s *NewScheduleShift) { s.StartTime = "24:00" }, "24:00"},
        {"Unknown designation",
            func(s *NewScheduleShift) { s.Designation = "Supervisor" }, "Supervisor"},
        {"Empty designation",
            func(s *NewScheduleShift) { s.Designation = "" }, ""},
        // ... all ~36 invalid cases in one table
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            shift := validShift // copy
            tt.mutate(&shift)
            req := NewScheduleRequest{Shifts: []NewScheduleShift{shift}}

            err := validateNewScheduleRequest(req)
            if err == nil {
                t.Errorf("validateNewScheduleRequest() with %s: expected error, got nil", tt.name)
            }
        })
    }
}
```

### When NOT to collapse

Some tests have the same function-under-test but different test structure. Keep these separate:

**Sort tests** — each tests a different sorting behavior (by position, by name within position, by keyword match). The assertions differ fundamentally.

**Single-scenario tests** — if each case needs >10 lines of setup, collapsing makes the table unreadable. Split into separate functions.

**Mixed pass/fail tests** — tests that check both success and error paths for the same function should be separate. Combining `shouldError: true/false` in one table is OK only if the assertion logic is simple (an if/else).

### Decision flowchart

```
Are you copy-pasting a test function and only changing
field values or test case names?
    ├── YES, >3 times → collapse into parameterized table
    ├── YES, 2-3 times → table-driven with t.Run is fine either way
    └── NO, setup/assertions differ → keep separate functions
```

## Failure messages

Every `t.Error` / `t.Errorf` must make the failure obvious without reading the test code.

### Required format

```go
// For function-call tests: show input and both values
t.Errorf("%s(%v) = %v, want %v", funcName, input, got, want)

// For validation tests: show the invalid input
t.Errorf("validateX(%q): expected error, got nil", invalidInput)

// For error-path tests: show both errors
t.Errorf("expected error %v, got %v", expectedErr, gotErr)
```

### Anti-patterns

| ❌ Bad | ✅ Good |
|--------|---------|
| `t.Fail()` — no information | `t.Errorf("ConvertDateToTime(%q, %q) = %v, want %v", date, format, got, want)` |
| `t.Error("expected != parsed")` — ambiguous | `t.Errorf("getIdTokenFromBearerToken(%q) = %q, want %q", input, got, want)` |
| `t.Errorf("Expected %v, but got %v", ...)` — no function name or input | `t.Errorf("createAvailability(days, dates, canUpdate, showMonday) = %v, want %v", got, want)` |

## Test helper extraction

When the same struct literal appears in >3 test cases, extract a constructor:

```go
// Before: 36 test cases each constructing the full NewScheduleShift literal
shift := NewScheduleShift{
    ShiftTitle: "Morning Shift", Employee: "John Smith (123)",
    Date: "2025-05-04", StartTime: "09:00", EndTime: "17:00",
    BreakDuration: "00:30:00", Designation: "Games",
}

// After: one-line constructor
shift := validShift()
// Then override only the field being tested:
shift.Employee = "bad value"
```

Helper naming convention: `valid<Type>()` returns a fully valid instance with realistic defaults.

## Test style

- **Table-driven** with `t.Run` for each case
- One test function per behavior being tested
- Cover edge cases: empty inputs, boundaries, malformed data, unexpected values
- Use `reflect.DeepEqual` for struct/slice comparisons (consistent with existing codebase)
- Test files live next to source: `foo.go` → `foo_test.go`
- Naming: `Test<FunctionName>` for direct tests, `Test<FunctionName>_<Scenario>` for specific behaviors
