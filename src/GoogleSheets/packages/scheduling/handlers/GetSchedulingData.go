package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/schedule/Schedule"
	"log"
)

func Get() (Data, error) {
	availabilitySheet, err := Availability.Connect()
	if err != nil {
		return Data{}, err
	}
	scheduleSheet, err := Schedule.Connect()
	if err != nil {
		return Data{}, err
	}

	availability, err := availabilitySheet.GetAvailabilityForTheWeek()
	if err != nil {
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - found availability for the week: %v", availability)

	scheduleMetadata, err := scheduleSheet.GetScheduleMetadata()
	if err != nil {
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - found schedule metadata: %v", availability)

	return Data{
		Availability:     availability,
		ScheduleMetadata: scheduleMetadata,
	}, nil
}
