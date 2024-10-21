package Availability

import (
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"log"
)

func Update(employee EmployeeInfo.EmployeeInfo, newAvailability *EmployeeAvailability) error {
	sheet, err := Connect()
	if err != nil {
		return err
	}

	err = sheet.Update(employee, newAvailability)
	if err != nil {
		return err
	}

	log.Printf("[INFO] Availability updated for %s: %v", employee.Id, newAvailability)
	return nil
}
