package Availability

import (
	"log"
)

func Update(employeeId string, newAvailability *EmployeeAvailability) error {
	sheet, err := Connect()
	if err != nil {
		return err
	}

	err = sheet.Update(employeeId, newAvailability)
	if err != nil {
		return err
	}

	log.Printf("[INFO] Availability updated for %s: %v", employeeId, newAvailability)
	return nil
}
