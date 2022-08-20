package AvailabilityConstants

import "fmt"

type EMPLOYEE_AVAILABILITY struct {
	Day1 bool `json:"Day1"`
	Day2 bool `json:"Day2"`
	Day3 bool `json:"Day3"`
	Day4 bool `json:"Day4"`
}

const (
	EMPLOYEE_AVAILABILITY_NOT_FOUND  = "NOT_FOUND"
	AVAILABILITY_SHEET_ID            = "1nomP3VKJxYewKICTwtPj464uZLclPEBgLv4i-6PPtSY"
	AVAILABILITY_SHEET_SHEET_NAME    = "Links"
	AVAILABILITY_TIMESHEET_GET_RANGE = "Links!A2:J"
	AVAILABILITY_SHEET_DAY1_COLUMN   = "G"
	AVAILABILITY_SHEET_DAY4_COLUMN   = "J"
	GOOGLESHEETS_ROW_OFFSET          = 2 // 1 (index 0) + 1 (first row is title of columns)
)

var DEFAULT_EMPLOYEE_AVAILABILITY = EMPLOYEE_AVAILABILITY{
	Day1: false,
	Day2: false,
	Day3: false,
	Day4: false,
}

func GetUpdateAvailabilityRangeFromRow(employeeAvailabilityRow int) string {
	updateRange := fmt.Sprintf("%s%d:%s%d", AVAILABILITY_SHEET_DAY1_COLUMN, employeeAvailabilityRow, AVAILABILITY_SHEET_DAY4_COLUMN, employeeAvailabilityRow)
	return fmt.Sprintf("%s!%s", AVAILABILITY_SHEET_SHEET_NAME, updateRange)
}
