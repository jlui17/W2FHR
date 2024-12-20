package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/schedule/Schedule"
)

type Data struct {
	Availability     Availability.AvailabilityForTheWeek `json:"availability"`
	ScheduleMetadata Schedule.ScheduleMetadata           `json:"scheduleMetadata"`
}

type UpdateSchedulingRequest struct {
	StartOfWeek    *string `json:"startOfWeek,omitempty"`
	ShowMonday     *bool   `json:"showMonday,omitempty"`
	DisableUpdates *bool   `json:"disableUpdates,omitempty"`
}
