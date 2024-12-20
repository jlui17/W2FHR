package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/common/TimeUtil"
	"log"
)

func Update(req UpdateSchedulingRequest) error {
	availabilitySheet, err := Availability.Connect()
	if err != nil {
		log.Printf("[ERROR] Error connecting to availability sheet: %v", err)
		return err
	}

	if req.StartOfWeek != nil {
		log.Printf("[INFO] Updating StartOfWeek to %s", *req.StartOfWeek)
		newStart := TimeUtil.ConvertDateToTime(*req.StartOfWeek, TimeUtil.ApiDateFormat)
		if err := availabilitySheet.UpdateStartOfWeek(newStart); err != nil {
			log.Printf("[ERROR] Failed to update StartOfWeek: %v", err)
			return err
		}
		log.Print("[INFO] Successfully updated StartOfWeek")
	}

	if req.ShowMonday != nil {
		log.Printf("[INFO] Updating ShowMonday to %t", *req.ShowMonday)
		if err := availabilitySheet.UpdateShowMonday(*req.ShowMonday); err != nil {
			log.Printf("[ERROR] Failed to update showMonday: %v", err)
			return err
		}
		log.Print("[INFO] Successfully updated ShowMonday")
	}

	if req.DisableUpdates != nil {
		log.Printf("[INFO] Updating DisableUpdates to %t", *req.DisableUpdates)
		if err := availabilitySheet.UpdateCanUpdate(*req.DisableUpdates); err != nil {
			log.Printf("[ERROR] Failed to update DisableUpdates: %v", err)
			return err
		}
		log.Print("[INFO] Successfully updated DisableUpdates")
	}

	return nil
}
