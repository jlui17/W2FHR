package Schedule

import (
	"log"
)

func Get(employeeId string, upcoming bool) (*Timesheet, error) {
	timesheet, err := getTimesheet()
	if err != nil {
		log.Printf("[ERROR] Failed to get timesheet: %s", err.Error())
		return &Timesheet{}, nil
	}

	var employeeShifts *Timesheet

	switch upcoming {
	case true:
		log.Printf("[INFO] Getting upcoming shifts for employee: %s", employeeId)

		employeeShifts, err = timesheet.GetUpcoming(employeeId)
		if err != nil {
			log.Printf("[ERROR] Failed to get upcoming timesheet for employee: %s\nError: %s", employeeId, err.Error())
			return &Timesheet{}, nil
		}
	case false:
		log.Printf("[INFO] Getting all shifts for employee: %s", employeeId)

		employeeShifts, err = timesheet.Get(employeeId)
		if err != nil {
			log.Printf("[ERROR] Failed to get timesheet for employee: %s\nError: %s", employeeId, err.Error())
			return &Timesheet{}, nil
		}
	}

	return employeeShifts, err
}

func GetAllSchedules() (*ManagerTimesheet, error) {
	timesheet, err := getTimesheet()
	if err != nil {
		log.Printf("[ERROR] Failed to get timesheet: %s", err.Error())
		return &ManagerTimesheet{}, nil
	}

	var allShifts *ManagerTimesheet

	allShifts, err = timesheet.GetAll()
	if err != nil {
		log.Printf("[ERROR] Failed to get all timesheets\nError: %s", err.Error())
		return &ManagerTimesheet{}, nil
	}
	log.Printf("[INFO] Getting all schedules for managers")

	return allShifts, nil
}
