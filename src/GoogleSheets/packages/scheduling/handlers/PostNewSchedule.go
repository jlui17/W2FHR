package Scheduling

import (
	"GoogleSheets/packages/common/TimeUtil"
	Schedule "GoogleSheets/packages/schedule/handlers"
	"log"
	"time"
)

func New(req NewScheduleRequest) error {
	log.Printf("[INFO] Scheduling - received new schedule request: %v", req)
	err := validateNewScheduleRequest(req)
	if err != nil {
		log.Printf("[ERROR] Scheduling - invalid new schedule request: %v", err)
		return err
	}
	log.Printf("[INFO] Scheduling - new schedule request is valid")

	client, err := Schedule.Connect()
	if err != nil {
		log.Printf("[ERROR] Scheduling - error connecting to google sheets: %v", err)
		return err
	}

	now := time.Now().Format(TimeUtil.ScheduleDateFormat)
	log.Printf("[INFO] Scheduling - current time: %v", now)
	newSchedule := convertNewScheduleRequestToInternal(req, now)
	log.Printf("[INFO] Scheduling - converted request to internal model: %v", newSchedule)
	err = client.PostNewSchedule(newSchedule)
	if err != nil {
		log.Printf("[ERROR] Scheduling - error posting new schedule: %v", err)
		return err
	}

	log.Printf("[INFO] Scheduling - successfully posted new schedule")
	return nil
}

func convertNewScheduleRequestToInternal(req NewScheduleRequest, currentTimeAsStr string) []Schedule.InternalShift {
	var res = make([]Schedule.InternalShift, len(req.Shifts))
	for i, shift := range req.Shifts {
		res[i] = Schedule.InternalShift{
			Employee:      shift.Employee,
			ShiftTitle:    shift.ShiftTitle,
			Date:          TimeUtil.ConvertDateToTime(shift.Date, TimeUtil.ApiDateFormat),
			StartTime:     shift.StartTime,
			EndTime:       shift.EndTime,
			BreakDuration: shift.BreakDuration,
			LastUpdated:   currentTimeAsStr,
			Designation:   shift.Designation,
		}
	}

	return res
}
