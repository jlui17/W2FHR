package Availability

import (
	"strings"
)

// positionPriority defines the sort order for different positions
// Attendant < Supervisor < Manager
var positionPriority = map[string]int{
	"Attendant":  1,
	"Supervisor": 2,
	"Manager":    3,
}

type AvailabilityForTheWeek map[string]AvailabileEmployees

type AvailabileEmployee struct {
	Name     string `json:"name"`
	Position string `json:"position"`
}

type AvailabileEmployees []AvailabileEmployee

// getPositionPriority returns the priority of a position based on keywords in the position string
// If no matching keywords are found, defaults to Attendant (lowest priority)
func getPositionPriority(position string) int {
	// Check for Manager keywords
	if strings.Contains(strings.ToLower(position), "manager") {
		return positionPriority["Manager"]
	}

	// Check for Supervisor keywords
	if strings.Contains(strings.ToLower(position), "supervisor") {
		return positionPriority["Supervisor"]
	}

	// Default to Attendant priority
	return positionPriority["Attendant"]
}

func (a AvailabileEmployees) Len() int {
	return len(a)
}

func (a AvailabileEmployees) Less(i, j int) bool {
	// First compare by position (Attendant < Supervisor < Manager)
	iPriority := getPositionPriority(a[i].Position)
	jPriority := getPositionPriority(a[j].Position)

	if iPriority != jPriority {
		return iPriority < jPriority
	}

	// If positions are equal, compare by name
	return a[i].Name < a[j].Name
}

func (a AvailabileEmployees) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}
