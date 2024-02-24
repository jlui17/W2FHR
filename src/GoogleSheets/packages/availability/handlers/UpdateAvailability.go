package Availability

import (
	"GoogleSheets/packages/common/GoogleClient"
	"fmt"
	"log"

	"google.golang.org/api/sheets/v4"
)

func Update(employeeId string, newAvailability *EmployeeAvailability) error {
	err := updateEmployeeAvailability(employeeId, newAvailability)
	if err != nil {
		return err
	}

	log.Printf("[INFO] Availability updated for %s: %v", employeeId, newAvailability)
	return nil
}

func updateEmployeeAvailability(employeeId string, newAvailability *EmployeeAvailability) error {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		return err
	}

	availability, err := sheetsService.GetAvailability()
	if err != nil {
		return err
	}

	if !availability.CanUpdate {
		return fmt.Errorf(UPDATE_AVAILABILITY_DISABLED_ERROR)
	}

	employeeRow, err := findRowOfEmployee(availability.EmployeeIds, employeeId)
	if err != nil {
		return err
	}

	updateValueRange := &sheets.ValueRange{
		Values: [][]interface{}{
			{
				newAvailability.Day1.IsAvailable,
				newAvailability.Day2.IsAvailable,
				newAvailability.Day3.IsAvailable,
				newAvailability.Day4.IsAvailable,
			},
		},
	}

	err = sheetsService.UpdateAvailability(employeeRow, updateValueRange)
	if err != nil {
		return err
	}

	return nil
}
