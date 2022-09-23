package AvailabilityConstants

import "fmt"

type EmployeeAvailabilityDay struct {
	IsAvailable bool   `json:"isAvailable"`
	Date        string `json:"date"`
}

type EmployeeAvailability struct {
	Day1 EmployeeAvailabilityDay `json:"Day1"`
	Day2 EmployeeAvailabilityDay `json:"Day2"`
	Day3 EmployeeAvailabilityDay `json:"Day3"`
	Day4 EmployeeAvailabilityDay `json:"Day4"`
}

const (
	EMPLOYEE_AVAILABILITY_NOT_FOUND = "EMPLOYEE_NOT_FOUND"
	AVAILABILITY_SHEET_ID           = "13LQSitRMmmyZPwvvDa5Pbf9yMWzKL2y0TaitaETqCmI"
	AVAILABILITY_SHEET_SHEET_NAME   = "Availability"
	AVAILABILITY_SHEET_DAY1_COLUMN  = "E"
	AVAILABILITY_SHEET_DAY4_COLUMN  = "H"
	GOOGLESHEETS_ROW_OFFSET         = 3 // 1 (index 0) + 1 (first row is title of column sections) + 1 (second row is title of columns)
)

var (
	DEFAULT_EMPLOYEE_AVAILABILITY = EmployeeAvailability{
		Day1: EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
		Day2: EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
		Day3: EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
		Day4: EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
	}
	AVAILABILITY_TIMESHEET_GET_RANGE = fmt.Sprintf("%s!A%d:%s200", AVAILABILITY_SHEET_SHEET_NAME, GOOGLESHEETS_ROW_OFFSET, AVAILABILITY_SHEET_DAY4_COLUMN)
)

func GetUpdateAvailabilityRangeFromRow(employeeAvailabilityRow int) string {
	updateRange := fmt.Sprintf("%s%d:%s%d", AVAILABILITY_SHEET_DAY1_COLUMN, employeeAvailabilityRow, AVAILABILITY_SHEET_DAY4_COLUMN, employeeAvailabilityRow)
	return fmt.Sprintf("%s!%s", AVAILABILITY_SHEET_SHEET_NAME, updateRange)
}
