package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/common/TimeUtil"
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
		log.Printf("[ERROR] Scheduling - error getting availability for the week: %v", err)
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - found availability for the week: %v", availability)

	scheduleMetadata, err := scheduleSheet.GetScheduleMetadata()
	if err != nil {
		log.Printf("[ERROR] Scheduling - error getting schedule metadata: %v", err)
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - found schedule metadata: %v", availability)

	canUpdateAvailability, err := availabilitySheet.CanUpdateAvailability()
	if err != nil {
		log.Printf("[ERROR] Scheduling - error checking if availability can be updated: %v", err)
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - can update availability: %v", canUpdateAvailability)

	showMonday, err := availabilitySheet.GetShowMonday()
	if err != nil {
		log.Printf("[ERROR] Scheduling - error getting show monday: %v", err)
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - show monday: %v", showMonday)

	startOfWeek, err := availabilitySheet.GetStartOfWeek()
	if err != nil {
		log.Printf("[ERROR] Scheduling - error getting start of week: %v", err)
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - start of week: %v", startOfWeek)

	return Data{
		Availability:   availability,
		Metadata:       scheduleMetadata,
		DisableUpdates: !canUpdateAvailability,
		ShowMonday:     showMonday,
		StartOfWeek:    startOfWeek.Format(TimeUtil.ScheduleDateFormat),
	}, nil
}
