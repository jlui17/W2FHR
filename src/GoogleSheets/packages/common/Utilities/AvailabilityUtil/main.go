package AvailabilityUtil

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/TimeService"
)

func CreateEmployeeAvailability(isAvailableDay1 bool, isAvailableDay2 bool, isAvailableDay3 bool, isAvailableDay4 bool) (*AvailabilityConstants.EmployeeAvailability, error) {
	dates, err := TimeService.GetDatesForSettingAvailability()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return &AvailabilityConstants.EmployeeAvailability{
		Day1: AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay1, Date: (*dates)[0]},
		Day2: AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay2, Date: (*dates)[1]},
		Day3: AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay3, Date: (*dates)[2]},
		Day4: AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay4, Date: (*dates)[3]},
	}, nil
}
