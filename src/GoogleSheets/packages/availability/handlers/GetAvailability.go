package Availability

import (
	"log"
)

func Get(employeeId string) (*EmployeeAvailability, error) {
	sheet, err := getAvailabilitySheet()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	return doGet(employeeId, sheet)
}

func doGet(employeeId string, sheet availabilitySheet) (*EmployeeAvailability, error) {
	all, err := sheet.Get()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	r, err := findRowOfEmployee(all.EmployeeIds, employeeId)
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	day1 := all.Availabilities[r][0] == "TRUE"
	day2 := all.Availabilities[r][1] == "TRUE"
	day3 := all.Availabilities[r][2] == "TRUE"
	day4 := all.Availabilities[r][3] == "TRUE"

	res := &EmployeeAvailability{
		Day1:      EmployeeAvailabilityDay{IsAvailable: day1, Date: all.Dates[0].(string)},
		Day2:      EmployeeAvailabilityDay{IsAvailable: day2, Date: all.Dates[1].(string)},
		Day3:      EmployeeAvailabilityDay{IsAvailable: day3, Date: all.Dates[2].(string)},
		Day4:      EmployeeAvailabilityDay{IsAvailable: day4, Date: all.Dates[3].(string)},
		CanUpdate: all.CanUpdate,
	}
	log.Printf("[INFO] Found availability for %s: %v", employeeId, res)
	return res, nil
}
