package Scheduling

import Availability "GoogleSheets/packages/availability/handlers"

type SchedulingData struct {
	Availability Availability.AvailabilityForTheWeek `json:"availability"`
}
