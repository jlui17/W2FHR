package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/schedule/Schedule"
	"fmt"
	"regexp"
)

type Data struct {
	Availability   Availability.AvailabilityForTheWeek `json:"availability"`
	Metadata       Schedule.Metadata                   `json:"metadata"`
	ShowMonday     bool                                `json:"showMonday"`
	StartOfWeek    string                              `json:"startOfWeek"`
	DisableUpdates bool                                `json:"disableUpdates"`
}

type UpdateSchedulingRequest struct {
	StartOfWeek    *string `json:"startOfWeek,omitempty"`
	ShowMonday     *bool   `json:"showMonday,omitempty"`
	DisableUpdates *bool   `json:"disableUpdates,omitempty"`
}

type NewScheduleRequest struct {
	Shifts []NewScheduleShift `json:"shifts"`
}

type NewScheduleShift struct {
	ShiftTitle    string `json:"shiftTitle"`
	Employee      string `json:"employee"`
	Date          string `json:"date"`
	StartTime     string `json:"startTime"`
	EndTime       string `json:"endTime"`
	BreakDuration string `json:"breakDuration"`
}

func validateNewScheduleRequest(request NewScheduleRequest) error {
	employeePattern := regexp.MustCompile(`^.+ \(.+\)$`)                                   // "John Smith (123)"
	datePattern := regexp.MustCompile(`^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$`) // "YYYY-MM-DD"
	timePattern := regexp.MustCompile(`^(?:0?[1-9]|1[0-2]):[0-5][0-9] (?:am|pm)$`)         // "HH:MM am/pm"
	breakPattern := regexp.MustCompile(`^\d{2}:\d{2}:\d{2}$`)                              // "xx:xx:xx"

	for i, shift := range request.Shifts {
		if !employeePattern.MatchString(shift.Employee) {
			return fmt.Errorf("shift %d: employee format invalid. Must be 'Name (ID)', got: %s", i+1, shift.Employee)
		}

		if !datePattern.MatchString(shift.Date) {
			return fmt.Errorf("shift %d: date format invalid. Must be 'YYYY-MM-DD', got: %s", i+1, shift.Date)
		}

		if !timePattern.MatchString(shift.StartTime) {
			return fmt.Errorf("shift %d: start time format invalid. Must be 'HH:MM am/pm', got: %s", i+1, shift.StartTime)
		}

		if !timePattern.MatchString(shift.EndTime) {
			return fmt.Errorf("shift %d: end time format invalid. Must be 'HH:MM am/pm', got: %s", i+1, shift.EndTime)
		}

		if !breakPattern.MatchString(shift.BreakDuration) {
			return fmt.Errorf("shift %d: break duration format invalid. Must be 'xx:xx:xx', got: %s", i+1, shift.BreakDuration)
		}
	}

	return nil
}
