package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"log"
)

func Get() (SchedulingData, error) {
	availabilitySheet, err := Availability.Connect()
	if err != nil {
		return SchedulingData{}, err
	}

	availability, err := availabilitySheet.GetAvailabilityForTheWeek()
	if err != nil {
		return SchedulingData{}, err
	}
	log.Printf("[INFO] Scheduling - found availability for the week: %v", availability)

	return SchedulingData{
		Availability: availability,
	}, nil
}
