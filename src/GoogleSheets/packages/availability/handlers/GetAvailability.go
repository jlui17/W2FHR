package Availability

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"errors"
	"log"
)

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
	UPDATE_AVAILABILITY_DISABLED_ERROR = "UPDATE_AVAILABILITY_DISABLED_ERROR"
)

func Get(employeeId string) (*EmployeeAvailability, error) {
	employeeAvailability, err := getEmployeeAvailability(employeeId)
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	log.Printf("[INFO] Found availability for %s: %v", employeeId, employeeAvailability)
	return employeeAvailability, nil
}

func getEmployeeAvailability(employeeId string) (*EmployeeAvailability, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	res, err := sheetsService.GetAvailability()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	r, err := findRowOfEmployee(res.EmployeeIds, employeeId)
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	day1 := res.Availabilities[r][0] == "TRUE"
	day2 := res.Availabilities[r][1] == "TRUE"
	day3 := res.Availabilities[r][2] == "TRUE"
	day4 := res.Availabilities[r][3] == "TRUE"

	return &EmployeeAvailability{
		Day1:      EmployeeAvailabilityDay{IsAvailable: day1, Date: res.Dates[0].(string)},
		Day2:      EmployeeAvailabilityDay{IsAvailable: day2, Date: res.Dates[1].(string)},
		Day3:      EmployeeAvailabilityDay{IsAvailable: day3, Date: res.Dates[2].(string)},
		Day4:      EmployeeAvailabilityDay{IsAvailable: day4, Date: res.Dates[3].(string)},
		CanUpdate: res.CanUpdate,
	}, nil
}

func findRowOfEmployee(employeeIds [][]interface{}, employeeId string) (int, error) {
	for i, row := range employeeIds {
		if row[0] == employeeId {
			return i, nil
		}
	}
	return 0, errors.New(SharedConstants.EMPLOYEE_NOT_FOUND_ERROR)
}
