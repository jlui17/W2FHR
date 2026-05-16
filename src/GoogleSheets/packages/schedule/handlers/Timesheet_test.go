package Schedule

import (
	"reflect"
	"testing"
	"time"

	"google.golang.org/api/sheets/v4"
)

func TestTranslateShiftsToGoogleSheets(t *testing.T) {
	tests := []struct {
		name   string
		shifts []InternalShift
		want   *sheets.ValueRange
	}{
		{
			name:   "empty shifts",
			shifts: []InternalShift{},
			want:   &sheets.ValueRange{Values: [][]interface{}{}},
		},
		{
			name: "single shift",
			shifts: []InternalShift{
				{
					ShiftTitle:    "Morning Shift",
					Employee:      "John Smith (123)",
					Date:          time.Date(2025, 5, 4, 0, 0, 0, 0, time.UTC),
					StartTime:     "09:00",
					EndTime:       "17:00",
					BreakDuration: "00:30:00",
					LastUpdated:   "2025-05-04 12:00",
					Designation:   "Games",
				},
			},
			want: &sheets.ValueRange{Values: [][]interface{}{
				{"Morning Shift", "John Smith (123)", "Sunday, May 4, 2025", "09:00", "17:00", "00:30:00", "Games", "2025-05-04 12:00"},
			}},
		},
		{
			name: "multiple shifts preserve order",
			shifts: []InternalShift{
				{
					ShiftTitle:    "First Shift",
					Employee:      "Alice (1)",
					Date:          time.Date(2025, 5, 4, 0, 0, 0, 0, time.UTC),
					StartTime:     "08:00",
					EndTime:       "12:00",
					BreakDuration: "00:15:00",
					LastUpdated:   "now",
					Designation:   "Games",
				},
				{
					ShiftTitle:    "Second Shift",
					Employee:      "Bob (2)",
					Date:          time.Date(2025, 5, 5, 0, 0, 0, 0, time.UTC),
					StartTime:     "13:00",
					EndTime:       "17:00",
					BreakDuration: "00:30:00",
					LastUpdated:   "now",
					Designation:   "Water Walkers",
				},
			},
			want: &sheets.ValueRange{Values: [][]interface{}{
				{"First Shift", "Alice (1)", "Sunday, May 4, 2025", "08:00", "12:00", "00:15:00", "Games", "now"},
				{"Second Shift", "Bob (2)", "Monday, May 5, 2025", "13:00", "17:00", "00:30:00", "Water Walkers", "now"},
			}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := translateShiftsToGoogleSheets(tt.shifts)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("translateShiftsToGoogleSheets() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestPutScheduleRange(t *testing.T) {
	tests := []struct {
		name    string
		start   int
		numRows int
		want    string
	}{
		{
			name:    "single row at row 3",
			start:   3,
			numRows: 1,
			want:    "'Main Schedule'!A3:H4",
		},
		{
			name:    "multiple rows",
			start:   5,
			numRows: 3,
			want:    "'Main Schedule'!A5:H8",
		},
		{
			name:    "zero rows",
			start:   10,
			numRows: 0,
			want:    "'Main Schedule'!A10:H10",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := putScheduleRange(tt.start, tt.numRows)
			if got != tt.want {
				t.Errorf("putScheduleRange(%d, %d) = %q, want %q", tt.start, tt.numRows, got, tt.want)
			}
		})
	}
}

func TestGetShifts(t *testing.T) {
	sched := &schedule{
		EmployeeIds:    []string{"123", "456", "123"},
		EmployeeNames:  []string{"John", "Jane", ""},
		ShiftTitles:    []string{"Morning", "Evening", "Night"},
		Dates:          []string{"2025-05-04", "2025-05-04", "2025-05-05"},
		StartTimes:     []string{"09:00", "17:00", "22:00"},
		EndTimes:       []string{"17:00", "21:00", "06:00"},
		BreakDurations: []string{"00:30:00", "00:15:00", "01:00:00"},
		NetHours:       []string{"7.5", "4", "8"},
	}

	ts := &timesheet{}

	tests := []struct {
		name       string
		employeeId string
		want       *Timesheet
	}{
		{
			name:       "employee with multiple shifts",
			employeeId: "123",
			want: &Timesheet{
				Shifts: []ExternalShift{
					{
						ShiftTitle:    "Morning",
						Date:          "2025-05-04",
						StartTime:     "09:00",
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						NetHours:      7.5,
					},
					{
						ShiftTitle:    "Night",
						Date:          "2025-05-05",
						StartTime:     "22:00",
						EndTime:       "06:00",
						BreakDuration: "01:00:00",
						NetHours:      8,
					},
				},
			},
		},
		{
			name:       "employee not in schedule",
			employeeId: "999",
			want:       &Timesheet{Shifts: []ExternalShift{}},
		},
		{
			name:       "empty schedule",
			employeeId: "123",
			want:       &Timesheet{Shifts: []ExternalShift{}},
		},
	}

	// Run the non-empty-schedule tests
	for _, tt := range tests[:2] {
		t.Run(tt.name, func(t *testing.T) {
			got := ts.getShifts(tt.employeeId, sched)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getShifts() = %v, want %v", got, tt.want)
			}
		})
	}

	// Empty schedule test
	t.Run("empty schedule", func(t *testing.T) {
		got := ts.getShifts("123", &emptySchedule)
		want := &Timesheet{Shifts: []ExternalShift{}}
		if !reflect.DeepEqual(got, want) {
			t.Errorf("getShifts() = %v, want %v", got, want)
		}
	})
}

func TestGetShiftsByTimeRange(t *testing.T) {
	vancouver, _ := time.LoadLocation("America/Los_Angeles")
	sched := &schedule{
		EmployeeIds:    []string{"123", "456", "123"},
		EmployeeNames:  []string{"John", "Jane", ""},
		ShiftTitles:    []string{"Morning", "Evening", "Night"},
		Dates:          []string{"Saturday, May 3, 2025", "Sunday, May 4, 2025", "Monday, May 5, 2025"},
		StartTimes:     []string{"09:00", "17:00", "22:00"},
		EndTimes:       []string{"17:00", "21:00", "06:00"},
		BreakDurations: []string{"00:30:00", "00:15:00", "01:00:00"},
		NetHours:       []string{"7.5", "4", "8"},
	}

	ts := &timesheet{}

	tests := []struct {
		name  string
		start time.Time
		end   time.Time
		want  *Timesheet
	}{
		{
			name:  "all shifts in range",
			start: time.Date(2025, 5, 1, 0, 0, 0, 0, vancouver),
			end:   time.Date(2025, 5, 10, 0, 0, 0, 0, vancouver),
			want: &Timesheet{
				Shifts: []ExternalShift{
					{
						EmployeeName:  "John",
						ShiftTitle:    "Morning",
						Date:          "Saturday, May 3, 2025",
						StartTime:     "09:00",
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						NetHours:      7.5,
					},
					{
						EmployeeName:  "Jane",
						ShiftTitle:    "Evening",
						Date:          "Sunday, May 4, 2025",
						StartTime:     "17:00",
						EndTime:       "21:00",
						BreakDuration: "00:15:00",
						NetHours:      4,
					},
					{
						EmployeeName:  "",
						ShiftTitle:    "Night",
						Date:          "Monday, May 5, 2025",
						StartTime:     "22:00",
						EndTime:       "06:00",
						BreakDuration: "01:00:00",
						NetHours:      8,
					},
				},
			},
		},
		{
			name:  "no shifts in range",
			start: time.Date(2025, 5, 10, 0, 0, 0, 0, vancouver),
			end:   time.Date(2025, 5, 15, 0, 0, 0, 0, vancouver),
			want:  &Timesheet{Shifts: []ExternalShift{}},
		},
		{
			name:  "exact date match",
			start: time.Date(2025, 5, 4, 0, 0, 0, 0, vancouver),
			end:   time.Date(2025, 5, 4, 0, 0, 0, 0, vancouver),
			want: &Timesheet{
				Shifts: []ExternalShift{
					{
						EmployeeName:  "Jane",
						ShiftTitle:    "Evening",
						Date:          "Sunday, May 4, 2025",
						StartTime:     "17:00",
						EndTime:       "21:00",
						BreakDuration: "00:15:00",
						NetHours:      4,
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ts.getShiftsByTimeRange(tt.start, tt.end, sched)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getShiftsByTimeRange() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestRangeHelpers(t *testing.T) {
	tests := []struct {
		name string
		fn   func(string) string
		arg  string
		want string
	}{
		{"employeeIdsRange", employeeIdsRange, "Main Schedule", "Main Schedule!K2:K"},
		{"shiftNamesRange", shiftNamesRange, "Main Schedule", "Main Schedule!A2:A"},
		{"employeeNamesRange", employeeNamesRange, "Main Schedule", "Main Schedule!B2:B"},
		{"datesRange", datesRange, "Main Schedule", "Main Schedule!C2:C"},
		{"startTimesRange", startTimesRange, "Main Schedule", "Main Schedule!D2:D"},
		{"endTimesRange", endTimesRange, "Main Schedule", "Main Schedule!E2:E"},
		{"breakDurationsRange", breakDurationsRange, "Main Schedule", "Main Schedule!F2:F"},
		{"designationsRange", designationsRange, "Main Schedule", "Main Schedule!G2:G"},
		{"netHoursRange", netHoursRange, "Main Schedule", "Main Schedule!M2:M"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.fn(tt.arg)
			if got != tt.want {
				t.Errorf("%s(%q) = %q, want %q", tt.name, tt.arg, got, tt.want)
			}
		})
	}

	t.Run("upcoming sheet name", func(t *testing.T) {
		got := employeeIdsRange("Upcoming Shifts")
		want := "Upcoming Shifts!K2:K"
		if got != want {
			t.Errorf("employeeIdsRange(%q) = %q, want %q", "Upcoming Shifts", got, want)
		}
	})
}
