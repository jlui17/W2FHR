package Schedule

import (
	"GoogleSheets/packages/common/GoogleClient"
	"fmt"
	"log"
	"strconv"

	"google.golang.org/api/sheets/v4"
)

const (
	scheduleSheetId               = "13opuSCYugK7dKPF6iMl8iy1u2grKO_v7HHesHONN20w"
	upcomingScheduleRangeTemplate = "%s!%s2:%s200"
	scheduleRangeTemplate         = "%s!%s2:%s"
	scheduleUpcomingSheetName     = "Upcoming Shifts"
	scheduleSheetName             = "Main Schedule"
	scheduleEmployeeIdCol         = "C"
	scheduleTitleCol              = "E"
	scheduleDataColStart          = "G"
	scheduleDataColEnd            = "K"
)

var (
	sheetsService *sheets.Service

	upcomingScheduleEmployeeIds = fmt.Sprintf(upcomingScheduleRangeTemplate, scheduleUpcomingSheetName,
		scheduleEmployeeIdCol,
		scheduleEmployeeIdCol)
	upcomingScheduleShiftNames = fmt.Sprintf(upcomingScheduleRangeTemplate, scheduleUpcomingSheetName,
		scheduleTitleCol,
		scheduleTitleCol)
	upcomingScheduleData = fmt.Sprintf(upcomingScheduleRangeTemplate, scheduleUpcomingSheetName,
		scheduleDataColStart,
		scheduleDataColEnd)
	scheduleEmployeeIds = fmt.Sprintf(scheduleRangeTemplate, scheduleSheetName,
		scheduleEmployeeIdCol,
		scheduleEmployeeIdCol)
	scheduleShiftNames = fmt.Sprintf(scheduleRangeTemplate, scheduleSheetName,
		scheduleTitleCol,
		scheduleTitleCol)
	scheduleData = fmt.Sprintf(scheduleRangeTemplate, scheduleSheetName,
		scheduleDataColStart,
		scheduleDataColEnd)
)

type Timesheet struct {
	Shifts []EmployeeShift `json:"shifts"`
}

type EmployeeShift struct {
	Date          string  `json:"date"`
	ShiftTitle    string  `json:"shiftTitle"`
	StartTime     string  `json:"startTime"`
	EndTime       string  `json:"endTime"`
	BreakDuration string  `json:"breakDuration"`
	NetHours      float64 `json:"netHours"`
}

type allSchedules struct {
	EmployeeIds [][]interface{}
	ShiftNames  [][]interface{}
	Shifts      [][]interface{}
}

type timesheet struct {
	service *sheets.Service
}

func getTimesheet() (*timesheet, error) {
	service, err := GoogleClient.New()
	if err != nil {
		return &timesheet{}, err
	}

	return &timesheet{service: service}, nil
}

func (t *timesheet) Get(employeeId string) (*Timesheet, error) {
	all, err := t.getSchedule()
	if err != nil {
		return &Timesheet{}, err
	}

	return t.getShifts(employeeId, all), nil
}

func (t *timesheet) GetUpcoming(employeeId string) (*Timesheet, error) {
	all, err := t.getUpcomingSchedule()
	if err != nil {
		return &Timesheet{}, err
	}

	return t.getShifts(employeeId, all), nil
}

func (t *timesheet) getSchedule() (*allSchedules, error) {
	response, err := t.service.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(
			scheduleEmployeeIds,
			scheduleShiftNames,
			scheduleData,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &allSchedules{}, err
	}

	return &allSchedules{
		EmployeeIds: response.ValueRanges[0].Values,
		ShiftNames:  response.ValueRanges[1].Values,
		Shifts:      response.ValueRanges[2].Values,
	}, nil
}

func (t *timesheet) getUpcomingSchedule() (*allSchedules, error) {
	response, err := t.service.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(
			upcomingScheduleEmployeeIds,
			upcomingScheduleShiftNames,
			upcomingScheduleData,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &allSchedules{}, err
	}

	return &allSchedules{
		EmployeeIds: response.ValueRanges[0].Values,
		ShiftNames:  response.ValueRanges[1].Values,
		Shifts:      response.ValueRanges[2].Values,
	}, nil
}

func (t *timesheet) getShifts(employeeId string, schedule *allSchedules) *Timesheet {
	employeeShifts := []EmployeeShift{}
	for i := 0; i < len(schedule.EmployeeIds); i++ {
		if len(schedule.EmployeeIds[i]) != 1 {
			continue
		}

		if schedule.EmployeeIds[i][0] == employeeId {
			netHours, err := strconv.ParseFloat(schedule.Shifts[i][4].(string), 64)
			if err != nil {
				log.Printf("[ERROR] Trying to parse nethours : %s", err.Error())
			}
			employeeShifts = append(employeeShifts, EmployeeShift{
				ShiftTitle:    schedule.ShiftNames[i][0].(string),
				Date:          schedule.Shifts[i][0].(string),
				StartTime:     schedule.Shifts[i][1].(string),
				EndTime:       schedule.Shifts[i][2].(string),
				BreakDuration: schedule.Shifts[i][3].(string),
				NetHours:      netHours,
			})
		}
	}

	return &Timesheet{
		Shifts: employeeShifts,
	}
}
