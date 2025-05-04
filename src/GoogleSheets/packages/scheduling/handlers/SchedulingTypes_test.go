package Scheduling

import (
	"testing"
)

func TestValidateNewScheduleRequest_ValidRequest(t *testing.T) {
	// Test a completely valid request
	validRequest := NewScheduleRequest{
		Shifts: []NewScheduleShift{
			{
				ShiftTitle:    "Morning Shift",
				Employee:      "John Smith (123)",
				Date:          "2025-05-04",
				StartTime:     "09:00",
				EndTime:       "17:00",
				BreakDuration: "00:30:00",
				Designation:   "Games",
			},
		},
	}

	err := validateNewScheduleRequest(validRequest)
	if err != nil {
		t.Errorf("Expected no error for valid request, got: %v", err)
	}
}

func TestValidateNewScheduleRequest_EmptyRequest(t *testing.T) {
	// Test with no shifts
	emptyRequest := NewScheduleRequest{
		Shifts: []NewScheduleShift{},
	}

	err := validateNewScheduleRequest(emptyRequest)
	if err != nil {
		t.Errorf("Expected no error for empty shifts array, got: %v", err)
	}
}

func TestValidateNewScheduleRequest_MultipleValidShifts(t *testing.T) {
	// Test with multiple valid shifts
	request := NewScheduleRequest{
		Shifts: []NewScheduleShift{
			{
				ShiftTitle:    "Morning Shift",
				Employee:      "John Smith (123)",
				Date:          "2025-05-04",
				StartTime:     "09:00",
				EndTime:       "17:00",
				BreakDuration: "00:30:00",
				Designation:   "Games",
			},
			{
				ShiftTitle:    "Evening Shift",
				Employee:      "Jane Doe (456)",
				Date:          "2025-05-04",
				StartTime:     "18:00",
				EndTime:       "22:00",
				BreakDuration: "00:15:00",
				Designation:   "Water Walkers",
			},
		},
	}

	err := validateNewScheduleRequest(request)
	if err != nil {
		t.Errorf("Expected no error for multiple valid shifts, got: %v", err)
	}
}

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
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "Morning Shift",
						Employee:      tc.employee,
						Date:          "2025-05-04",
						StartTime:     "09:00",
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						Designation:   "Games",
					},
				},
			}

			err := validateNewScheduleRequest(request)
			if err == nil {
				t.Errorf("Expected error for invalid employee format '%s', but got none", tc.employee)
			}
		})
	}
}

func TestValidateNewScheduleRequest_InvalidDate(t *testing.T) {
	testCases := []struct {
		name string
		date string
	}{
		{"Wrong Format", "05/04/2025"},
		{"Invalid Month", "2025-13-04"},
		{"Invalid Day", "2025-05-32"},
		{"Missing Parts", "2025-05"},
		{"Empty Date", ""},
		{"Wrong Order", "04-05-2025"},
		{"Non-numeric", "YYYY-MM-DD"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			request := NewScheduleRequest{
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "Morning Shift",
						Employee:      "John Smith (123)",
						Date:          tc.date,
						StartTime:     "09:00",
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						Designation:   "Games",
					},
				},
			}

			err := validateNewScheduleRequest(request)
			if err == nil {
				t.Errorf("Expected error for invalid date format '%s', but got none", tc.date)
			}
		})
	}
}

func TestValidateNewScheduleRequest_InvalidStartTime(t *testing.T) {
	testCases := []struct {
		name      string
		startTime string
	}{
		{"Wrong Format", "9:00 AM"},
		{"Missing Colon", "0900"},
		{"Out Of Range Hours", "24:00"},
		{"Out Of Range Minutes", "09:60"},
		{"Empty Time", ""},
		{"Extra Characters", "09:00:00"},
		{"Non-numeric", "HH:MM"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			request := NewScheduleRequest{
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "Morning Shift",
						Employee:      "John Smith (123)",
						Date:          "2025-05-04",
						StartTime:     tc.startTime,
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						Designation:   "Games",
					},
				},
			}

			err := validateNewScheduleRequest(request)
			if err == nil {
				t.Errorf("Expected error for invalid start time format '%s', but got none", tc.startTime)
			}
		})
	}
}

func TestValidateNewScheduleRequest_InvalidEndTime(t *testing.T) {
	testCases := []struct {
		name    string
		endTime string
	}{
		{"Wrong Format", "5:00 PM"},
		{"Missing Colon", "1700"},
		{"Out Of Range Hours", "24:00"},
		{"Out Of Range Minutes", "17:60"},
		{"Empty Time", ""},
		{"Extra Characters", "17:00:00"},
		{"Non-numeric", "HH:MM"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			request := NewScheduleRequest{
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "Morning Shift",
						Employee:      "John Smith (123)",
						Date:          "2025-05-04",
						StartTime:     "09:00",
						EndTime:       tc.endTime,
						BreakDuration: "00:30:00",
						Designation:   "Games",
					},
				},
			}

			err := validateNewScheduleRequest(request)
			if err == nil {
				t.Errorf("Expected error for invalid end time format '%s', but got none", tc.endTime)
			}
		})
	}
}

func TestValidateNewScheduleRequest_InvalidBreakDuration(t *testing.T) {
	testCases := []struct {
		name          string
		breakDuration string
	}{
		{"Wrong Format", "30:00"},
		{"Missing Colons", "003000"},
		{"Empty Duration", ""},
		{"Missing Parts", "00:30"},
		{"Wrong Format With Text", "30 minutes"},
		{"Non-numeric", "xx:xx:xx"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			request := NewScheduleRequest{
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "Morning Shift",
						Employee:      "John Smith (123)",
						Date:          "2025-05-04",
						StartTime:     "09:00",
						EndTime:       "17:00",
						BreakDuration: tc.breakDuration,
						Designation:   "Games",
					},
				},
			}

			err := validateNewScheduleRequest(request)
			if err == nil {
				t.Errorf("Expected error for invalid break duration format '%s', but got none", tc.breakDuration)
			}
		})
	}
}

func TestValidateNewScheduleRequest_InvalidDesignation(t *testing.T) {
	testCases := []struct {
		name        string
		designation string
	}{
		{"Unknown Designation", "Supervisor"},
		{"Empty Designation", ""},
		{"Lowercase", "games"},
		{"Misspelled", "Game"},
		{"Whitespace", " Games "},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			request := NewScheduleRequest{
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "Morning Shift",
						Employee:      "John Smith (123)",
						Date:          "2025-05-04",
						StartTime:     "09:00",
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						Designation:   tc.designation,
					},
				},
			}

			err := validateNewScheduleRequest(request)
			if err == nil {
				t.Errorf("Expected error for invalid designation '%s', but got none", tc.designation)
			}
		})
	}
}

func TestValidateNewScheduleRequest_ValidEdgeCases(t *testing.T) {
	testCases := []struct {
		name        string
		shift       NewScheduleShift
		shouldError bool
	}{
		{
			"Minimum Time Values",
			NewScheduleShift{
				ShiftTitle:    "Midnight Shift",
				Employee:      "John Smith (123)",
				Date:          "2025-05-04",
				StartTime:     "00:00",
				EndTime:       "00:01",
				BreakDuration: "00:00:00",
				Designation:   "Games",
			},
			false,
		},
		{
			"Maximum Time Values",
			NewScheduleShift{
				ShiftTitle:    "Late Night Shift",
				Employee:      "John Smith (123)",
				Date:          "2025-05-04",
				StartTime:     "23:59",
				EndTime:       "23:59",
				BreakDuration: "99:59:59", // Technically valid format
				Designation:   "Water Walkers",
			},
			false,
		},
		{
			"Complex Employee Name",
			NewScheduleShift{
				ShiftTitle:    "Morning Shift",
				Employee:      "John O'Connor-Smith Jr. (ABC123)",
				Date:          "2025-05-04",
				StartTime:     "09:00",
				EndTime:       "17:00",
				BreakDuration: "00:30:00",
				Designation:   "Games",
			},
			false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			request := NewScheduleRequest{
				Shifts: []NewScheduleShift{tc.shift},
			}

			err := validateNewScheduleRequest(request)
			if tc.shouldError && err == nil {
				t.Errorf("Expected error for %s, but got none", tc.name)
			} else if !tc.shouldError && err != nil {
				t.Errorf("Expected no error for %s, got: %v", tc.name, err)
			}
		})
	}
}

func TestValidateNewScheduleRequest_ErrorIndexing(t *testing.T) {
	// Test that errors refer to the correct shift index
	request := NewScheduleRequest{
		Shifts: []NewScheduleShift{
			{
				ShiftTitle:    "Valid Shift",
				Employee:      "John Smith (123)",
				Date:          "2025-05-04",
				StartTime:     "09:00",
				EndTime:       "17:00",
				BreakDuration: "00:30:00",
				Designation:   "Games",
			},
			{
				ShiftTitle:    "Invalid Shift",
				Employee:      "Invalid Employee",
				Date:          "2025-05-04",
				StartTime:     "09:00",
				EndTime:       "17:00",
				BreakDuration: "00:30:00",
				Designation:   "Games",
			},
		},
	}

	err := validateNewScheduleRequest(request)
	if err == nil {
		t.Errorf("Expected error for invalid shift, but got none")
		return
	}

	// Check that the error refers to shift 2 (index 1 + 1)
	expectedErrorPrefix := "shift 2: employee format invalid"
	if err != nil && err.Error()[:len(expectedErrorPrefix)] != expectedErrorPrefix {
		t.Errorf("Error should reference shift 2, got: %v", err)
	}
}
