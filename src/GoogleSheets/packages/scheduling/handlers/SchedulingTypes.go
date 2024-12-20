package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/schedule/Schedule"
)

type Data struct {
	Availability   Availability.AvailabilityForTheWeek `json:"availability"`
	Metadata       Schedule.Metadata                   `json:"metadata"`
	ShowMonday     bool                                `json:"showMonday"`
	StartOfWeek    string                              `json:"startOfWeek"`
	DisableUpdates bool                                `json:"disableUpdates"`
}

type UpdateSchedulingRequest struct {
	StartOfWeek    *string `json:"startOfWeek,omitempty"`
	ShowMonday     *bool   `json:"showMonday,omitempty"`
	DisableUpdates *bool   `json:"disableUpdates,omitempty"`
}
