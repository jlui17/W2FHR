package TimesheetConstants

const (
	TIMESHEET_SHEET_ID                = "14WqDRHFk92TDY18lDBTVUSJ43VW2zS37jN3Dl45jd6o"
	MASTER_TIMESHEET_SHEET_NAME       = "Master Timesheet"
	TIMESHEET_GET_RANGE               = "A2:J"
	TIMESHEET_VIEWING_DATE_READ_RANGE = "B4:E4"
)

type Timesheet struct {
	Shifts       *[]*EmployeeShift `json:"shifts"`
	ViewingDates *[]string         `json:"viewingDates"`
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
		Shifts:       &[]*EmployeeShift{},
		ViewingDates: &[]string{},
	}
)
