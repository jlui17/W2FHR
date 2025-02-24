package Availability

import (
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"log"
)

func Get(info EmployeeInfo.EmployeeInfo) (*EmployeeAvailability, error) {
	sheet, err := Connect()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	employeeAvailability, err := sheet.Get(info)
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	log.Printf("[INFO] Found availability for %s: %v", info.Id, employeeAvailability)
	return employeeAvailability, nil
}

func GetAvailabilityForTheWeek() (AvailabilityForTheWeek, error) {
	sheet, err := Connect()
	if err != nil {
		return AvailabilityForTheWeek{}, err
	}
	availabilityForTheWeek, err := sheet.GetAvailabilityForTheWeek()
	if err != nil {
		return AvailabilityForTheWeek{}, err
	}
	log.Printf("[INFO] Found availability for the week: %v", availabilityForTheWeek)
	return availabilityForTheWeek, nil
}
