package Availability

import (
	"log"
)

func Get(employeeId string) (*EmployeeAvailability, error) {
	sheet, err := getAvailabilitySheet()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	employeeAvailability, err := sheet.Get(employeeId)
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	log.Printf("[INFO] Found availability for %s: %v", employeeId, employeeAvailability)
	return employeeAvailability, nil
}
