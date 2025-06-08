package Scheduling

import (
	Availability "GoogleSheets/packages/availability/handlers"
	"GoogleSheets/packages/common/TimeUtil"
	Schedule "GoogleSheets/packages/schedule/handlers"
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

	// Get date range for the week
	endDate := startOfWeek
	daysToAdd := 3 // Default 4 days total
	if showMonday {
		daysToAdd = 4 // 5 days if showing Monday
	}
	endDate = endDate.AddDate(0, 0, daysToAdd)

	// Get scheduled shifts for the current week
	scheduledShifts, err := scheduleSheet.GetByTimeRange(startOfWeek, endDate)
	if err != nil {
		log.Printf("[ERROR] Scheduling - error getting scheduled shifts: %v", err)
		return Data{}, err
	}
	log.Printf("[INFO] Scheduling - found %d scheduled shifts for the week", len(scheduledShifts.Shifts))

	// Create map of scheduled employees by date
	scheduledEmployees := makeScheduledEmployeesMap(scheduledShifts.Shifts)
	log.Printf("[INFO] Scheduling - created scheduled employees map: %v", scheduledEmployees)

	return Data{
		Availability:       availability,
		ScheduledEmployees: scheduledEmployees,
		Metadata:           scheduleMetadata,
		DisableUpdates:     !canUpdateAvailability,
		ShowMonday:         showMonday,
		StartOfWeek:        startOfWeek.Format(TimeUtil.ScheduleDateFormat),
	}, nil
}

// Helper function to organize shifts by date with just employee names
func makeScheduledEmployeesMap(shifts []Schedule.ExternalShift) ScheduledEmployeesForTheWeek {
	result := ScheduledEmployeesForTheWeek{}

	for _, shift := range shifts {
		date := shift.Date

		// Create the slice if this is the first employee for this date
		if _, exists := result[date]; !exists {
			result[date] = ScheduledEmployees{}
		}

		// Add this employee to the list for this date
		employee := ScheduledEmployee{
			Name: shift.EmployeeName,
		}

		// Check if this employee is already in the list for this date to avoid duplicates
		alreadyAdded := false
		for _, existingEmp := range result[date] {
			if existingEmp.Name == employee.Name {
				alreadyAdded = true
				break
			}
		}

		if !alreadyAdded {
			result[date] = append(result[date], employee)
		}
	}

	return result
}
