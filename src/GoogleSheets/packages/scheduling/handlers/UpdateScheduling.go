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

	if req.StartOfWeek != "" {
		log.Printf("[INFO] Updating start of week to %s", req.StartOfWeek)
		newStart := TimeUtil.ConvertDateToTime(req.StartOfWeek, TimeUtil.ApiDateFormat)
		if err := availabilitySheet.UpdateStartOfWeek(newStart); err != nil {
			log.Printf("[ERROR] Failed to update newStart of week: %v", err)
			return err
		}
		log.Print("[INFO] Successfully updated start of week")
	}

	return nil
}
