package Scheduling

import (
	Schedule "GoogleSheets/packages/schedule/handlers"
	"reflect"
	"testing"
)

func TestMakeScheduledEmployeesMap(t *testing.T) {
	// Test cases for the helper function that creates the map
	tests := []struct {
		name   string
		shifts []Schedule.ExternalShift
		want   ScheduledEmployeesForTheWeek
	}{
		{
			name:   "Empty shifts",
			shifts: []Schedule.ExternalShift{},
			want:   ScheduledEmployeesForTheWeek{},
		},
		{
			name: "Single shift",
			shifts: []Schedule.ExternalShift{
				{
					EmployeeName:  "John Smith",
					Date:          "2025-05-23",
					ShiftTitle:    "Morning Shift",
					StartTime:     "09:00",
					EndTime:       "17:00",
					BreakDuration: "00:30:00",
					NetHours:      7.5,
				},
			},
			want: ScheduledEmployeesForTheWeek{
				"2025-05-23": ScheduledEmployees{
					{Name: "John Smith"},
				},
			},
		},
		{
			name: "Multiple shifts same employee same day",
			shifts: []Schedule.ExternalShift{
				{
					EmployeeName: "John Smith",
					Date:         "2025-05-23",
					ShiftTitle:   "Morning Shift",
					StartTime:    "09:00",
					EndTime:      "13:00",
				},
				{
					EmployeeName: "John Smith",
					Date:         "2025-05-23",
					ShiftTitle:   "Evening Shift",
					StartTime:    "17:00",
					EndTime:      "21:00",
				},
			},
			want: ScheduledEmployeesForTheWeek{
				"2025-05-23": ScheduledEmployees{
					{Name: "John Smith"}, // Should only appear once
				},
			},
		},
		{
			name: "Multiple employees multiple days",
			shifts: []Schedule.ExternalShift{
				{
					EmployeeName: "John Smith",
					Date:         "2025-05-23",
					ShiftTitle:   "Morning Shift",
				},
				{
					EmployeeName: "Jane Doe",
					Date:         "2025-05-23",
					ShiftTitle:   "Evening Shift",
				},
				{
					EmployeeName: "John Smith",
					Date:         "2025-05-24",
					ShiftTitle:   "Morning Shift",
				},
				{
					EmployeeName: "Bob Johnson",
					Date:         "2025-05-25",
					ShiftTitle:   "Morning Shift",
				},
			},
			want: ScheduledEmployeesForTheWeek{
				"2025-05-23": ScheduledEmployees{
					{Name: "John Smith"},
					{Name: "Jane Doe"},
				},
				"2025-05-24": ScheduledEmployees{
					{Name: "John Smith"},
				},
				"2025-05-25": ScheduledEmployees{
					{Name: "Bob Johnson"},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := makeScheduledEmployeesMap(tt.shifts)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("makeScheduledEmployeesMap() = %v, want %v", got, tt.want)
			}
		})
	}
}
