package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	Schedule "GoogleSheets/packages/schedule/handlers"
	"fmt"
	"regexp"
)

// ScheduledEmployeesForTheWeek maps dates to lists of scheduled employees
type ScheduledEmployeesForTheWeek map[string]ScheduledEmployees

// ScheduledEmployee represents a scheduled employee with just their name for now
type ScheduledEmployee struct {
	Name string `json:"name"` // Just include the name for now
}

// ScheduledEmployees is a slice of ScheduledEmployee
type ScheduledEmployees []ScheduledEmployee

type Data struct {
	Availability       Availability.AvailabilityForTheWeek `json:"availability"`
	ScheduledEmployees ScheduledEmployeesForTheWeek        `json:"scheduledEmployees"`
	Metadata           Schedule.Metadata                   `json:"metadata"`
	ShowMonday         bool                                `json:"showMonday"`
	StartOfWeek        string                              `json:"startOfWeek"`
	DisableUpdates     bool                                `json:"disableUpdates"`
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
	Designation   string `json:"designation"`
}

var (
	employeePattern = regexp.MustCompile(`^.+ \(.+\)$`)                                       // "John Smith (123)"
	datePattern     = regexp.MustCompile(`^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$`) // "YYYY-MM-DD"
	timePattern     = regexp.MustCompile(`^(?:[01]?[0-9]|2[0-3]):[0-5][0-9]$`)                // "HH:MM"
	breakPattern    = regexp.MustCompile(`^\d{2}:\d{2}:\d{2}$`)                               // "xx:xx:xx"
)

func validateNewScheduleRequest(request NewScheduleRequest) error {
	for i, shift := range request.Shifts {
		if !employeePattern.MatchString(shift.Employee) {
			return fmt.Errorf("shift %d: employee format invalid. Must be 'Name (ID)', got: %s", i+1, shift.Employee)
		}

		if !datePattern.MatchString(shift.Date) {
			return fmt.Errorf("shift %d: date format invalid. Must be 'YYYY-MM-DD', got: %s", i+1, shift.Date)
		}

		if !timePattern.MatchString(shift.StartTime) {
			return fmt.Errorf("shift %d: start time format invalid. Must be 'HH:MM', got: %s", i+1, shift.StartTime)
		}

		if !timePattern.MatchString(shift.EndTime) {
			return fmt.Errorf("shift %d: end time format invalid. Must be 'HH:MM', got: %s", i+1, shift.EndTime)
		}

		if !breakPattern.MatchString(shift.BreakDuration) {
			return fmt.Errorf("shift %d: break duration format invalid. Must be 'xx:xx:xx', got: %s", i+1, shift.BreakDuration)
		}

		if shift.Designation != "Games" && shift.Designation != "Water Walkers" {
			return fmt.Errorf("shift %d: designation must be 'Games' or 'Water Walkers', got: %s", i+1, shift.Designation)
		}
	}

	return nil
}
