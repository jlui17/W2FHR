package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/schedule/Schedule"
)

type SchedulingData struct {
	Availability     Availability.AvailabilityForTheWeek `json:"availability"`
	ScheduleMetadata Schedule.ScheduleMetadata           `json:"scheduleMetadata"`
}
