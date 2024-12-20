package Schedule

import (
	"GoogleSheets/packages/common/TimeUtil"
	"errors"
	"fmt"
	"log"
	"time"
)

func Get(employeeId string, upcoming bool) (*Timesheet, error) {
	timesheet, err := Connect()
	if err != nil {
		log.Printf("[ERROR] Failed to connect to Google Sheets: %s", err.Error())
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

func GetByTimeRange(start string, end string) (*Timesheet, error) {
	timesheet, err := Connect()
	if err != nil {
		log.Printf("[ERROR] Failed to connect to Google Sheets: %s", err.Error())
		return &Timesheet{}, nil
	}

	startAsDate, endAsDate, err := getStartAndEndDates(start, end)
	if err != nil {
		log.Printf("[DEBUG] Invalid time range: %s", err.Error())
		return &Timesheet{}, nil
	}

	shifts, err := timesheet.GetByTimeRange(startAsDate, endAsDate)
	if err != nil {
		log.Printf("[ERROR] Failed to get schedule from %s to %s: %s", start, end, err.Error())
		return &Timesheet{}, nil
	}

	return shifts, err
}

func getStartAndEndDates(start string, end string) (time.Time, time.Time, error) {
	startAsDate := TimeUtil.ConvertDateToTime(start, TimeUtil.ApiDateFormat)
	endAsDate := TimeUtil.ConvertDateToTime(end, TimeUtil.ApiDateFormat)

	if startAsDate.After(endAsDate) {
		return time.Time{}, time.Time{}, errors.New(fmt.Sprintf("start date (%s) cannot be after end date (%s)", start, end))
	}

	return startAsDate, endAsDate, nil
}
