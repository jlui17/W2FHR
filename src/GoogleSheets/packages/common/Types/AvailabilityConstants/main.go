package AvailabilityConstants

import "fmt"

type EMPLOYEE_AVAILABILITY struct {
	Day1 bool `json:"Day1"`
	Day2 bool `json:"Day2"`
	Day3 bool `json:"Day3"`
	Day4 bool `json:"Day4"`
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
	LETTER_TO_NUMBER_MAP = map[string]int{
		"A": 0,
		"B": 1,
		"C": 2,
		"D": 3,
		"E": 4,
		"F": 5,
		"G": 6,
		"H": 7,
		"I": 8,
		"J": 9,
		"K": 10,
		"L": 11,
		"M": 12,
		"N": 13,
		"O": 14,
		"P": 15,
		"Q": 16,
		"R": 17,
		"S": 18,
		"T": 19,
		"U": 20,
		"V": 21,
		"W": 22,
		"X": 23,
		"Y": 24,
		"Z": 25,
	}
	DEFAULT_EMPLOYEE_AVAILABILITY = EMPLOYEE_AVAILABILITY{
		Day1: false,
		Day2: false,
		Day3: false,
		Day4: false,
	}
	AVAILABILITY_TIMESHEET_GET_RANGE = fmt.Sprintf("%s!A%d:%s", AVAILABILITY_SHEET_SHEET_NAME, GOOGLESHEETS_ROW_OFFSET, AVAILABILITY_SHEET_DAY4_COLUMN)
	ALLOW_ORIGINS_HEADER             = map[string]string{"Access-Control-Allow-Origin": "*"}
)

func GetUpdateAvailabilityRangeFromRow(employeeAvailabilityRow int) string {
	updateRange := fmt.Sprintf("%s%d:%s%d", AVAILABILITY_SHEET_DAY1_COLUMN, employeeAvailabilityRow, AVAILABILITY_SHEET_DAY4_COLUMN, employeeAvailabilityRow)
	return fmt.Sprintf("%s!%s", AVAILABILITY_SHEET_SHEET_NAME, updateRange)
}
