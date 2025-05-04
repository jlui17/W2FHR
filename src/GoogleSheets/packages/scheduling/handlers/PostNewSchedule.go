package Scheduling

import (
	"GoogleSheets/packages/common/TimeUtil"
	Schedule "GoogleSheets/packages/schedule/handlers"
	"log"
	"sort"
	"time"
)

func New(req NewScheduleRequest) error {
	err := validateNewScheduleRequest(req)
	if err != nil {
		log.Printf("[ERROR] Scheduling - invalid new schedule request: %v", err)
		return err
	}

	client, err := Schedule.Connect()
	if err != nil {
		log.Printf("[ERROR] Scheduling - error connecting to google sheets: %v", err)
		return err
	}

	now := time.Now()
	newSchedule := convertNewScheduleRequestToInternal(req, now.Format(TimeUtil.ScheduleDateFormat))
	sort.Sort(newSchedule)
	err = client.PostNewSchedule(newSchedule)
	if err != nil {
		log.Printf("[ERROR] Scheduling - error posting new schedule: %v", err)
		return err
	}

	log.Printf("[INFO] Scheduling - successfully posted new schedule")
	return nil
}

func convertNewScheduleRequestToInternal(req NewScheduleRequest, currentTimeAsStr string) Schedule.InternalShifts {
	var res = make(Schedule.InternalShifts, len(req.Shifts))
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
