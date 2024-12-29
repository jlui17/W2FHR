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
	schedulePutColStart           = "E"
	schedulePutColEnd             = "J"
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
	scheduleMetadata              = "'Data Validation'!AE2:AG"
	scheduleMetadataEmployeeNames = "'Data Validation'!H2:H"
)

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

func (t *timesheet) GetScheduleMetadata() (Metadata, error) {
	response, err := t.service.Spreadsheets.Values.BatchGet(scheduleSheetId).
		Ranges(
			scheduleMetadata,
			scheduleMetadataEmployeeNames,
		).
		MajorDimension("COLUMNS").
		Do()
	log.Printf("[DEBUG] Response from Google Sheets: %v", response)
	if err != nil {
		log.Printf("[ERROR] Trying to get schedule metadata: %s", err.Error())
		return Metadata{}, err
	}

	res := Metadata{
		ShiftTitles:         SharedConstants.DToStrArr(response.ValueRanges[0].Values[0]),
		ShiftTimes:          SharedConstants.DToStrArr(response.ValueRanges[0].Values[1]),
		BreakDurations:      SharedConstants.DToStrArr(response.ValueRanges[0].Values[2]),
		EmployeeNamesAndIds: SharedConstants.DToStrArr(response.ValueRanges[1].Values[0]),
	}
	log.Printf("[DEBUG] Formatted schedule: %v", res)
	return res, nil
}

func (t *timesheet) PostNewSchedule(newSchedule InternalShifts) error {
	input := translateShiftsToGoogleSheets(newSchedule)

	start, err := t.getNextRowNumForNewSchedule()
	if err != nil {
		log.Printf("[ERROR] Trying to get next row for new schedule: %s", err.Error())
		return err
	}
	log.Printf("[DEBUG] Next row for new schedule: %d", start)

	updateRange := putScheduleRange(start, len(input.Values))
	log.Printf("[DEBUG] Update range for new schedule: %s", updateRange)
	_, err = t.service.Spreadsheets.Values.
		Update(
			scheduleSheetId,
			updateRange,
			input,
		).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		log.Printf("[ERROR] Trying to post new schedule: %s", err.Error())
		return err
	}

	return nil
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
	employeeShifts := []ExternalShift{}
	for i, id := range schedule.EmployeeIds {
		if id == employeeId {
			netHours, err := strconv.ParseFloat(schedule.ShiftInfo[i][4], 64)
			if err != nil {
				log.Printf("[ERROR] Trying to parse nethours : %s", err.Error())
			}
			employeeShifts = append(employeeShifts, ExternalShift{
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
	employeeShifts := []ExternalShift{}
	for i, _ := range schedule.EmployeeIds {
		shiftDate := TimeUtil.ConvertDateToTime(schedule.ShiftInfo[i][0], TimeUtil.ScheduleDateFormat)

		if (start.Equal(shiftDate) || start.Before(shiftDate)) && (end.Equal(shiftDate) || end.After(shiftDate)) {
			netHours, err := strconv.ParseFloat(schedule.ShiftInfo[i][4], 64)
			if err != nil {
				log.Printf("[ERROR] Trying to parse nethours : %s", err.Error())
			}
			employeeShifts = append(employeeShifts, ExternalShift{
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

func (t *timesheet) getNextRowNumForNewSchedule() (int, error) {
	response, err := t.service.Spreadsheets.Values.
		Get(scheduleSheetId, scheduleShiftNames).
		Do()
	log.Printf("[DEBUG] Num rows from Google Sheets: %d", len(response.Values))
	if err != nil {
		return 0, err
	}

	return len(response.Values) + 2, nil // +1 since range starts at 2, +1 for the next row
}

func translateShiftsToGoogleSheets(shifts InternalShifts) *sheets.ValueRange {
	var res = make([][]interface{}, len(shifts))
	for i, shift := range shifts {
		res[i] = []interface{}{
			shift.ShiftTitle,
			shift.Employee,
			shift.Date.Format(TimeUtil.ScheduleDateFormat),
			shift.StartTime,
			shift.EndTime,
			shift.BreakDuration,
		}
	}

	return &sheets.ValueRange{
		Values: res,
	}
}

func putScheduleRange(start int, numRows int) string {
	return fmt.Sprintf(SharedConstants.GoogleSheetsRangeTemplate,
		scheduleSheetName,
		schedulePutColStart,
		start,
		schedulePutColEnd,
		start+numRows,
	)
}
