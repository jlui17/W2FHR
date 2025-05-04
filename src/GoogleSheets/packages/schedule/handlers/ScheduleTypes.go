package Schedule

import "time"

type Metadata struct {
	ShiftTitles         []string `json:"shiftTitles"`
	ShiftTimes          []string `json:"shiftTimes"`
	BreakDurations      []string `json:"breakDurations"`
	EmployeeNamesAndIds []string `json:"employeeNamesAndIds"`
}

type Timesheet struct {
	Shifts []ExternalShift `json:"shifts"`
}

type schedule struct {
	Dates          []string
	EmployeeIds    []string
	EmployeeNames  []string
	ShiftTitles    []string
	StartTimes     []string
	EndTimes       []string
	BreakDurations []string
	NetHours       []string
}

type ExternalShift struct {
	EmployeeName  string  `json:"employeeName"`
	Date          string  `json:"date"`
	ShiftTitle    string  `json:"shiftTitle"`
	StartTime     string  `json:"startTime"`
	EndTime       string  `json:"endTime"`
	BreakDuration string  `json:"breakDuration"`
	NetHours      float64 `json:"netHours"`
}

type InternalShift struct {
	ShiftTitle    string
	Employee      string
	Date          time.Time
	StartTime     string
	EndTime       string
	BreakDuration string
	LastUpdated   string
	Designation   string
}
