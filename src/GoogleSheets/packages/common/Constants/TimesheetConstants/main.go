package TimesheetConstants

const (
	TIMESHEET_SHEET_ID          = "14WqDRHFk92TDY18lDBTVUSJ43VW2zS37jN3Dl45jd6o"
	MASTER_TIMESHEET_SHEET_NAME = "Master Timesheet"
	TIMESHEET_GET_RANGE         = "A2:J"
	DATE_FORMAT                 = "Monday, January 2, 2006"
	EMPLOYEE_ID_COLUMN          = "C"
	DATE_COLUMN                 = "G"
	SHIFT_TITLE_COLUMN          = "E"
	START_TIME_COLUMN           = "H"
	END_TIME_COLUMN             = "I"
	BREAK_DURATION_COLUMN       = "J"
)

type Timesheet struct {
	Shifts []EmployeeShift `json:"shifts"`
}

type EmployeeShift struct {
	Date          string `json:"date"`
	ShiftTitle    string `json:"shiftTitle"`
	StartTime     string `json:"startTime"`
	EndTime       string `json:"endTime"`
	BreakDuration string `json:"breakDuration"`
}

var (
	DEFAULT_TIMESHEET = &Timesheet{
		Shifts: []EmployeeShift{},
	}
)
