package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/schedule/Schedule"
	"log"
)

func Get() (SchedulingData, error) {
	availabilitySheet, err := Availability.Connect()
	if err != nil {
		return SchedulingData{}, err
	}
	scheduleSheet, err := Schedule.Connect()
	if err != nil {
		return SchedulingData{}, err
	}

	availability, err := availabilitySheet.GetAvailabilityForTheWeek()
	if err != nil {
		return SchedulingData{}, err
	}
	log.Printf("[INFO] Scheduling - found availability for the week: %v", availability)

	scheduleMetadata, err := scheduleSheet.GetScheduleMetadata()
	if err != nil {
		return SchedulingData{}, err
	}
	log.Printf("[INFO] Scheduling - found schedule metadata: %v", availability)

	return SchedulingData{
		Availability:     availability,
		ScheduleMetadata: scheduleMetadata,
	}, nil
}
