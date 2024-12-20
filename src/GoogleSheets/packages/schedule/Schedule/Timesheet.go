package Schedule

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/TimeUtil"
	"fmt"
	"google.golang.org/api/sheets/v4"
	"log"
	"strconv"
	"time"
)

const (
	scheduleSheetId               = "1qZKKoJNXHuo8pymDbGZuBV8WxD6tkgeKnao_H0OfrPk"
	upcomingScheduleRangeTemplate = "%s!%s2:%s200"
	scheduleRangeTemplate         = "%s!%s2:%s"
	scheduleUpcomingSheetName     = "Upcoming Shifts"
	scheduleSheetName             = "Main Schedule"
	scheduleEmployeeIdCol         = "C"
	scheduleTitleCol              = "E"
	scheduleDataColStart          = "G"
	scheduleDataColEnd            = "K"
	scheduleEmployeeNameCol       = "A"
)

var (
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
	scheduleEmployeeNames = fmt.Sprintf(scheduleRangeTemplate, scheduleSheetName,
		scheduleEmployeeNameCol,
		scheduleEmployeeNameCol)
	scheduleMetadata = "'Data Validation'!AE2:AG"
)

type Timesheet struct {
	Shifts []EmployeeShift `json:"shifts"`
}

type EmployeeShift struct {
	EmployeeName  string  `json:"employeeName"`
	Date          string  `json:"date"`
	ShiftTitle    string  `json:"shiftTitle"`
	StartTime     string  `json:"startTime"`
	EndTime       string  `json:"endTime"`
	BreakDuration string  `json:"breakDuration"`
	NetHours      float64 `json:"netHours"`
}

type schedule struct {
	EmployeeIds   []string
	EmployeeNames []string
	ShiftNames    [][]string
	ShiftInfo     [][]string
}

type timesheet struct {
	service *sheets.Service
}

func Connect() (*timesheet, error) {
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

func (t *timesheet) GetByTimeRange(start time.Time, end time.Time) (*Timesheet, error) {
	all, err := t.getSchedule()
	if err != nil {
		return &Timesheet{}, err
	}

	return t.getShiftsByTimeRange(start, end, all), nil
}

func (t *timesheet) GetScheduleMetadata() (ScheduleMetadata, error) {
	response, err := t.service.Spreadsheets.Values.
		Get(scheduleSheetId, scheduleMetadata).
		MajorDimension("COLUMNS").
		Do()
	log.Printf("[DEBUG] Response from Google Sheets: %v", response)
	if err != nil {
		log.Printf("[ERROR] Trying to get schedule metadata: %s", err.Error())
		return ScheduleMetadata{}, err
	}

	res := ScheduleMetadata{
		ShiftTitles:    SharedConstants.DToStrArr(response.Values[0]),
		ShiftTimes:     SharedConstants.DToStrArr(response.Values[1]),
		BreakDurations: SharedConstants.DToStrArr(response.Values[2]),
	}
	log.Printf("[DEBUG] Formatted schedule: %v", res)
	return res, nil
}

func (t *timesheet) getSchedule() (*schedule, error) {
	response, err := t.service.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(
			scheduleEmployeeIds,
			scheduleEmployeeNames,
			scheduleShiftNames,
			scheduleData,
		).
		MajorDimension("ROWS").
		Do()
	log.Printf("[DEBUG] Response from Google Sheets: %v", response)
	if err != nil {
		return &schedule{}, err
	}

	res := &schedule{
		EmployeeIds:   SharedConstants.DToStrArr(SharedConstants.Flatten(response.ValueRanges[0].Values)),
		EmployeeNames: SharedConstants.DToStrArr(SharedConstants.Flatten(response.ValueRanges[1].Values)),
		ShiftNames:    SharedConstants.DDToStrArr(response.ValueRanges[2].Values),
		ShiftInfo:     SharedConstants.DDToStrArr(response.ValueRanges[3].Values),
	}
	log.Printf("[DEBUG] Formatted schedule: %v", res)
	return res, nil
}

func (t *timesheet) getUpcomingSchedule() (*schedule, error) {
	response, err := t.service.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(
			upcomingScheduleEmployeeIds,
			upcomingScheduleShiftNames,
			upcomingScheduleData,
		).
		MajorDimension("ROWS").
		Do()
	log.Printf("[DEBUG] Response from Google Sheets: %v", response)
	if err != nil {
		return &schedule{}, err
	}

	res := &schedule{
		EmployeeIds: SharedConstants.DToStrArr(SharedConstants.Flatten(response.ValueRanges[0].Values)),
		ShiftNames:  SharedConstants.DDToStrArr(response.ValueRanges[1].Values),
		ShiftInfo:   SharedConstants.DDToStrArr(response.ValueRanges[2].Values),
	}
	log.Printf("[DEBUG] Formatted schedule: %v", res)
	return res, nil
}

func (t *timesheet) getShifts(employeeId string, schedule *schedule) *Timesheet {
	employeeShifts := []EmployeeShift{}
	for i, id := range schedule.EmployeeIds {
		if id == employeeId {
			netHours, err := strconv.ParseFloat(schedule.ShiftInfo[i][4], 64)
			if err != nil {
				log.Printf("[ERROR] Trying to parse nethours : %s", err.Error())
			}
			employeeShifts = append(employeeShifts, EmployeeShift{
				ShiftTitle:    schedule.ShiftNames[i][0],
				Date:          schedule.ShiftInfo[i][0],
				StartTime:     schedule.ShiftInfo[i][1],
				EndTime:       schedule.ShiftInfo[i][2],
				BreakDuration: schedule.ShiftInfo[i][3],
				NetHours:      netHours,
			})
		}
	}

	return &Timesheet{
		Shifts: employeeShifts,
	}
}

func (t *timesheet) getShiftsByTimeRange(start time.Time, end time.Time, schedule *schedule) *Timesheet {
	employeeShifts := []EmployeeShift{}
	for i, _ := range schedule.EmployeeIds {
		shiftDate := TimeUtil.ConvertDateToTime(schedule.ShiftInfo[i][0], TimeUtil.ScheduleDateFormat)

		if (start.Equal(shiftDate) || start.Before(shiftDate)) && (end.Equal(shiftDate) || end.After(shiftDate)) {
			netHours, err := strconv.ParseFloat(schedule.ShiftInfo[i][4], 64)
			if err != nil {
				log.Printf("[ERROR] Trying to parse nethours : %s", err.Error())
			}
			employeeShifts = append(employeeShifts, EmployeeShift{
				ShiftTitle:    schedule.ShiftNames[i][0],
				Date:          schedule.ShiftInfo[i][0],
				StartTime:     schedule.ShiftInfo[i][1],
				EndTime:       schedule.ShiftInfo[i][2],
				BreakDuration: schedule.ShiftInfo[i][3],
				NetHours:      netHours,
				EmployeeName:  schedule.EmployeeNames[i],
			})
		}
	}

	return &Timesheet{
		Shifts: employeeShifts,
	}
}
