package AvailabilityConstants

import "fmt"

type EmployeeAvailabilityDay struct {
	IsAvailable bool   `json:"isAvailable"`
	Date        string `json:"date"`
}

type EmployeeAvailability struct {
	Day1      EmployeeAvailabilityDay `json:"day1"`
	Day2      EmployeeAvailabilityDay `json:"day2"`
	Day3      EmployeeAvailabilityDay `json:"day3"`
	Day4      EmployeeAvailabilityDay `json:"day4"`
	CanUpdate bool                    `json:"canUpdate"`
}

const (
	UPDATE_AVAILABILITY_DISABLED_ERROR    = "UPDATE_AVAILABILITY_DISABLED_ERROR"
	AVAILABILITY_SHEET_ID                 = "13LQSitRMmmyZPwvvDa5Pbf9yMWzKL2y0TaitaETqCmI"
	AVAILABILITY_SHEET_SHEET_NAME         = "Availability"
	AVAILABILITY_SHEET_DAY1_COLUMN        = "E"
	AVAILABILITY_SHEET_DAY4_COLUMN        = "H"
	AVAILABILITY_CAN_UPDATE_CELL          = "G4"
	AVAILABILITY_VIEWING_DATES_READ_RANGE = "B5:E5"
	GOOGLESHEETS_ROW_OFFSET               = 3 // 1 (index 0) + 1 (first row is title of column sections) + 1 (second row is title of columns)
)

var (
	DEFAULT_EMPLOYEE_AVAILABILITY = EmployeeAvailability{
		Day1:      EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
		Day2:      EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
		Day3:      EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
		Day4:      EmployeeAvailabilityDay{IsAvailable: false, Date: ""},
		CanUpdate: false,
	}
	AVAILABILITY_TIMESHEET_GET_RANGE = fmt.Sprintf("%s!A%d:%s200", AVAILABILITY_SHEET_SHEET_NAME, GOOGLESHEETS_ROW_OFFSET, AVAILABILITY_SHEET_DAY4_COLUMN)
)

func GetUpdateAvailabilityRangeFromRow(employeeAvailabilityRow int) string {
	updateRange := fmt.Sprintf("%s%d:%s%d", AVAILABILITY_SHEET_DAY1_COLUMN, employeeAvailabilityRow, AVAILABILITY_SHEET_DAY4_COLUMN, employeeAvailabilityRow)
	return fmt.Sprintf("%s!%s", AVAILABILITY_SHEET_SHEET_NAME, updateRange)
}
