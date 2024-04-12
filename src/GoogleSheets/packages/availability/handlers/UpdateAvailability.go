package Availability

import (
	"fmt"
	"log"
)

func Update(employeeId string, newAvailability *EmployeeAvailability) error {
	sheet, err := getAvailabilitySheet()
	if err != nil {
		return err
	}

	err = doUpdate(employeeId, newAvailability, sheet)
	if err != nil {
		return err
	}

	log.Printf("[INFO] Availability updated for %s: %v", employeeId, newAvailability)
	return nil
}

func doUpdate(employeeId string, new *EmployeeAvailability, sheet availabilitySheet) error {
	all, err := sheet.Get()
	if err != nil {
		return err
	}

	if !all.CanUpdate {
		return fmt.Errorf(UPDATE_AVAILABILITY_DISABLED_ERROR)
	}

	row, err := findRowOfEmployee(all.EmployeeIds, employeeId)
	if err != nil {
		return err
	}

	return sheet.Update(row, new)
}
