package Scheduling

import (
	"testing"
)

// validShift returns a fully valid NewScheduleShift with realistic defaults.
func validShift() NewScheduleShift {
	return NewScheduleShift{
		ShiftTitle:    "Morning Shift",
		Employee:      "John Smith (123)",
		Date:          "2025-05-04",
		StartTime:     "09:00",
		EndTime:       "17:00",
		BreakDuration: "00:30:00",
		Designation:   "Games",
	}
}

func TestValidateNewScheduleRequest_ValidFields(t *testing.T) {
	tests := []struct {
		name  string
		shift NewScheduleShift
	}{
		{"single valid shift", validShift()},
		{"minimum time values", NewScheduleShift{
			ShiftTitle: "Midnight Shift", Employee: "John Smith (123)",
			Date: "2025-05-04", StartTime: "00:00", EndTime: "00:01",
			BreakDuration: "00:00:00", Designation: "Games",
		}},
		{"maximum time values", NewScheduleShift{
			ShiftTitle: "Late Night Shift", Employee: "John Smith (123)",
			Date: "2025-05-04", StartTime: "23:59", EndTime: "23:59",
			BreakDuration: "99:59:59", Designation: "Water Walkers",
		}},
		{"complex employee name", NewScheduleShift{
			ShiftTitle: "Morning Shift", Employee: "John O'Connor-Smith Jr. (ABC123)",
			Date: "2025-05-04", StartTime: "09:00", EndTime: "17:00",
			BreakDuration: "00:30:00", Designation: "Games",
		}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := NewScheduleRequest{Shifts: []NewScheduleShift{tt.shift}}
			if err := validateNewScheduleRequest(req); err != nil {
				t.Errorf("validateNewScheduleRequest(valid %s): unexpected error: %v", tt.name, err)
			}
		})
	}
}

func TestValidateNewScheduleRequest_EmptyShifts(t *testing.T) {
	req := NewScheduleRequest{Shifts: []NewScheduleShift{}}
	if err := validateNewScheduleRequest(req); err != nil {
		t.Errorf("validateNewScheduleRequest(empty shifts): unexpected error: %v", err)
	}
}

func TestValidateNewScheduleRequest_MultipleValidShifts(t *testing.T) {
	req := NewScheduleRequest{
		Shifts: []NewScheduleShift{
			validShift(),
			{
				ShiftTitle: "Evening Shift", Employee: "Jane Doe (456)",
				Date: "2025-05-04", StartTime: "18:00", EndTime: "22:00",
				BreakDuration: "00:15:00", Designation: "Water Walkers",
			},
		},
	}
	if err := validateNewScheduleRequest(req); err != nil {
		t.Errorf("validateNewScheduleRequest(multiple valid shifts): unexpected error: %v", err)
	}
}

func TestValidateNewScheduleRequest_InvalidFields(t *testing.T) {
	tests := []struct {
		name        string
		mutate      func(*NewScheduleShift)
		invalidDesc string // human-readable description of the invalid value
	}{
		// Employee
		{"employee missing parenthesis", func(s *NewScheduleShift) { s.Employee = "John Smith 123" }, "missing parenthesis"},
		{"empty employee", func(s *NewScheduleShift) { s.Employee = "" }, "empty"},
		{"employee only name no ID", func(s *NewScheduleShift) { s.Employee = "John Smith" }, "name only"},
		{"employee only ID no name", func(s *NewScheduleShift) { s.Employee = "(123)" }, "ID only"},

		// Date
		{"date wrong format MM/DD/YYYY", func(s *NewScheduleShift) { s.Date = "05/04/2025" }, "MM/DD/YYYY"},
		{"date invalid month 13", func(s *NewScheduleShift) { s.Date = "2025-13-04" }, "month 13"},
		{"date invalid day 32", func(s *NewScheduleShift) { s.Date = "2025-05-32" }, "day 32"},
		{"date missing parts", func(s *NewScheduleShift) { s.Date = "2025-05" }, "YYYY-MM only"},
		{"empty date", func(s *NewScheduleShift) { s.Date = "" }, "empty"},
		{"date wrong order DD-MM-YYYY", func(s *NewScheduleShift) { s.Date = "04-05-2025" }, "DD-MM-YYYY"},
		{"date non-numeric", func(s *NewScheduleShift) { s.Date = "YYYY-MM-DD" }, "non-numeric"},

		// Start time
		{"start time with AM/PM", func(s *NewScheduleShift) { s.StartTime = "9:00 AM" }, "AM/PM format"},
		{"start time missing colon", func(s *NewScheduleShift) { s.StartTime = "0900" }, "no colon"},
		{"start time hour out of range", func(s *NewScheduleShift) { s.StartTime = "24:00" }, "hour 24"},
		{"start time minute out of range", func(s *NewScheduleShift) { s.StartTime = "09:60" }, "minute 60"},
		{"empty start time", func(s *NewScheduleShift) { s.StartTime = "" }, "empty"},
		{"start time with seconds", func(s *NewScheduleShift) { s.StartTime = "09:00:00" }, "HH:MM:SS"},
		{"start time non-numeric", func(s *NewScheduleShift) { s.StartTime = "HH:MM" }, "non-numeric"},

		// End time
		{"end time with AM/PM", func(s *NewScheduleShift) { s.EndTime = "5:00 PM" }, "AM/PM format"},
		{"end time missing colon", func(s *NewScheduleShift) { s.EndTime = "1700" }, "no colon"},
		{"end time hour out of range", func(s *NewScheduleShift) { s.EndTime = "24:00" }, "hour 24"},
		{"end time minute out of range", func(s *NewScheduleShift) { s.EndTime = "17:60" }, "minute 60"},
		{"empty end time", func(s *NewScheduleShift) { s.EndTime = "" }, "empty"},
		{"end time with seconds", func(s *NewScheduleShift) { s.EndTime = "17:00:00" }, "HH:MM:SS"},
		{"end time non-numeric", func(s *NewScheduleShift) { s.EndTime = "HH:MM" }, "non-numeric"},

		// Break duration
		{"break duration wrong format", func(s *NewScheduleShift) { s.BreakDuration = "30:00" }, "MM:SS instead of HH:MM:SS"},
		{"break duration missing colons", func(s *NewScheduleShift) { s.BreakDuration = "003000" }, "no colons"},
		{"empty break duration", func(s *NewScheduleShift) { s.BreakDuration = "" }, "empty"},
		{"break duration missing hours", func(s *NewScheduleShift) { s.BreakDuration = "00:30" }, "MM:SS only"},
		{"break duration with text", func(s *NewScheduleShift) { s.BreakDuration = "30 minutes" }, "descriptive text"},
		{"break duration non-numeric", func(s *NewScheduleShift) { s.BreakDuration = "xx:xx:xx" }, "non-numeric"},

		// Designation
		{"unknown designation", func(s *NewScheduleShift) { s.Designation = "Supervisor" }, "Supervisor"},
		{"empty designation", func(s *NewScheduleShift) { s.Designation = "" }, "empty"},
		{"lowercase designation", func(s *NewScheduleShift) { s.Designation = "games" }, "games"},
		{"misspelled designation", func(s *NewScheduleShift) { s.Designation = "Game" }, "Game"},
		{"designation with whitespace", func(s *NewScheduleShift) { s.Designation = " Games " }, "whitespace"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			shift := validShift()
			tt.mutate(&shift)
			req := NewScheduleRequest{Shifts: []NewScheduleShift{shift}}

			err := validateNewScheduleRequest(req)
			if err == nil {
				t.Errorf("validateNewScheduleRequest() with %s: expected error, got nil", tt.invalidDesc)
			}
		})
	}
}

func TestValidateNewScheduleRequest_ErrorIndexing(t *testing.T) {
	request := NewScheduleRequest{
		Shifts: []NewScheduleShift{
			validShift(),
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
		t.Errorf("validateNewScheduleRequest() with invalid shift 2: expected error, got nil")
		return
	}

	expectedErrorPrefix := "shift 2: employee format invalid"
	if err.Error()[:len(expectedErrorPrefix)] != expectedErrorPrefix {
		t.Errorf("validateNewScheduleRequest() error should reference shift 2, got: %v", err)
	}
}
