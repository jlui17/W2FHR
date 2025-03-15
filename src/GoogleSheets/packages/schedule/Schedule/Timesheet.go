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
	scheduleSheetId           = "1aD4gOklV79zj6ctsOH8N6mUB0cE-Nz5F_ZCh1Mww8zI"
	rangeTemplate             = "%s!%s2:%s"
	scheduleUpcomingSheetName = "Upcoming Shifts"
	scheduleSheetName         = "Main Schedule"

	scheduleEmployeeIdCol    = "K"
	scheduleTitleCol         = "A"
	scheduleEmployeeNameCol  = "J"
	scheduleDateCol          = "C"
	scheduleStartTimeCol     = "D"
	scheduleEndTimeCol       = "E"
	scheduleBreakDurationCol = "F"
	scheduleDesignationCol   = "G"
	scheduleNetHoursCol      = "M"
	schedulePutColStart      = "A"
	schedulePutColEnd        = "H"
)

var (
	scheduleMetadata              = "'Data Validation'!AE2:AG"
	scheduleMetadataEmployeeNames = "'Data Validation'!H2:H"

	emptySchedule = schedule{
		Dates:          []string{},
		EmployeeIds:    []string{},
		EmployeeNames:  []string{},
		ShiftTitles:    []string{},
		StartTimes:     []string{},
		EndTimes:       []string{},
		BreakDurations: []string{},
		NetHours:       []string{},
	}
)

func employeeIdsRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleEmployeeIdCol,
		scheduleEmployeeIdCol)
}
func shiftNamesRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleTitleCol,
		scheduleTitleCol)
}
func employeeNamesRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleEmployeeNameCol,
		scheduleEmployeeNameCol)
}
func datesRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleDateCol,
		scheduleDateCol)
}
func startTimesRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleStartTimeCol,
		scheduleStartTimeCol)
}
func endTimesRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleEndTimeCol,
		scheduleEndTimeCol)
}
func breakDurationsRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleBreakDurationCol,
		scheduleBreakDurationCol)
}
func designationsRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleDesignationCol,
		scheduleDesignationCol)
}
func netHoursRange(sheetName string) string {
	return fmt.Sprintf(rangeTemplate, sheetName,
		scheduleNetHoursCol,
		scheduleNetHoursCol)
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
	ranges := []string{
		employeeIdsRange(scheduleSheetName),
		employeeNamesRange(scheduleSheetName),
		shiftNamesRange(scheduleSheetName),
		datesRange(scheduleSheetName),
		startTimesRange(scheduleSheetName),
		endTimesRange(scheduleSheetName),
		breakDurationsRange(scheduleSheetName),
		netHoursRange(scheduleSheetName),
	}
	request := t.service.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(ranges...).
		MajorDimension("COLUMNS")
	response, err := request.Do()
	log.Printf("[DEBUG] Response from Google Sheets: %v", response)
	if err != nil {
		return &schedule{}, err
	}

	if len(response.ValueRanges) != len(ranges) {
		log.Printf("[ERROR] Trying to get schedule: expected %d value ranges while getting schedule, got %d", len(ranges), len(response.ValueRanges))
		return &schedule{}, fmt.Errorf("expected %d value ranges while getting schedule, got %d", len(ranges), len(response.ValueRanges))
	}

	employeeIds := response.ValueRanges[0].Values
	employeeNames := response.ValueRanges[1].Values
	shiftTitles := response.ValueRanges[2].Values
	dates := response.ValueRanges[3].Values
	startTimes := response.ValueRanges[4].Values
	endTimes := response.ValueRanges[5].Values
	breakDurations := response.ValueRanges[6].Values
	netHours := response.ValueRanges[7].Values
	if err = SharedConstants.All2DArraysSameLength(
		&employeeIds,
		&employeeNames,
		&shiftTitles,
		&dates,
		&startTimes,
		&endTimes,
		&breakDurations,
		&netHours); err != nil {
		log.Printf("[ERROR] Trying to get schedule: %s", err.Error())
		return &schedule{}, err
	}
	if len(employeeIds[0]) == 0 {
		return &emptySchedule, nil
	}

	res := schedule{
		EmployeeIds:    SharedConstants.DToStrArr(employeeIds[0]),
		EmployeeNames:  SharedConstants.DToStrArr(employeeNames[0]),
		ShiftTitles:    SharedConstants.DToStrArr(shiftTitles[0]),
		Dates:          SharedConstants.DToStrArr(dates[0]),
		StartTimes:     SharedConstants.DToStrArr(startTimes[0]),
		EndTimes:       SharedConstants.DToStrArr(endTimes[0]),
		BreakDurations: SharedConstants.DToStrArr(breakDurations[0]),
		NetHours:       SharedConstants.DToStrArr(netHours[0]),
	}
	log.Printf("[DEBUG] Formatted schedule: %v", res)
	return &res, nil
}

func (t *timesheet) getUpcomingSchedule() (*schedule, error) {
	ranges := []string{
		employeeIdsRange(scheduleUpcomingSheetName),
		employeeNamesRange(scheduleUpcomingSheetName),
		shiftNamesRange(scheduleUpcomingSheetName),
		datesRange(scheduleUpcomingSheetName),
		startTimesRange(scheduleUpcomingSheetName),
		endTimesRange(scheduleUpcomingSheetName),
		breakDurationsRange(scheduleUpcomingSheetName),
		netHoursRange(scheduleUpcomingSheetName),
	}
	response, err := t.service.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(ranges...).
		MajorDimension("COLUMNS").
		Do()
	log.Printf("[DEBUG] Response from Google Sheets: %v", response)
	if err != nil {
		return &schedule{}, err
	}

	if len(response.ValueRanges) != len(ranges) {
		log.Printf("[ERROR] Trying to get schedule: expected %d value ranges while getting schedule, got %d", len(ranges), len(response.ValueRanges))
		return &schedule{}, fmt.Errorf("expected %d value ranges while getting schedule, got %d", len(ranges), len(response.ValueRanges))
	}

	employeeIds := response.ValueRanges[0].Values
	employeeNames := response.ValueRanges[1].Values
	shiftTitles := response.ValueRanges[2].Values
	dates := response.ValueRanges[3].Values
	startTimes := response.ValueRanges[4].Values
	endTimes := response.ValueRanges[5].Values
	breakDurations := response.ValueRanges[6].Values
	netHours := response.ValueRanges[7].Values
	if err = SharedConstants.All2DArraysSameLength(
		&employeeIds,
		&employeeNames,
		&shiftTitles,
		&dates,
		&startTimes,
		&endTimes,
		&breakDurations,
		&netHours); err != nil {
		log.Printf("[ERROR] Trying to get schedule: %s", err.Error())
		return &schedule{}, err
	}
	if len(employeeIds) == 0 {
		return &emptySchedule, nil
	}

	res := schedule{
		EmployeeIds:    SharedConstants.DToStrArr(employeeIds[0]),
		EmployeeNames:  SharedConstants.DToStrArr(employeeNames[0]),
		ShiftTitles:    SharedConstants.DToStrArr(shiftTitles[0]),
		Dates:          SharedConstants.DToStrArr(dates[0]),
		StartTimes:     SharedConstants.DToStrArr(startTimes[0]),
		EndTimes:       SharedConstants.DToStrArr(endTimes[0]),
		BreakDurations: SharedConstants.DToStrArr(breakDurations[0]),
		NetHours:       SharedConstants.DToStrArr(netHours[0]),
	}
	log.Printf("[DEBUG] Formatted schedule: %v", res)
	return &res, nil
}

func (t *timesheet) getShifts(employeeId string, schedule *schedule) *Timesheet {
	employeeShifts := []ExternalShift{}
	for i, id := range schedule.EmployeeIds {
		if id == employeeId {
			netHours, err := strconv.ParseFloat(schedule.NetHours[i], 64)
			if err != nil {
				log.Printf("[ERROR] Trying to parse nethours: %s", err.Error())
			}
			employeeShifts = append(employeeShifts, ExternalShift{
				ShiftTitle:    schedule.ShiftTitles[i],
				Date:          schedule.Dates[i],
				StartTime:     schedule.StartTimes[i],
				EndTime:       schedule.EndTimes[i],
				BreakDuration: schedule.BreakDurations[i],
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
		shiftDate := TimeUtil.ConvertDateToTime(schedule.Dates[i], TimeUtil.ScheduleDateFormat)

		if (start.Equal(shiftDate) || start.Before(shiftDate)) && (end.Equal(shiftDate) || end.After(shiftDate)) {
			netHours, err := strconv.ParseFloat(schedule.NetHours[i], 64)
			if err != nil {
				log.Printf("[ERROR] Trying to parse nethours : %s", err.Error())
			}
			employeeShifts = append(employeeShifts, ExternalShift{
				ShiftTitle:    schedule.ShiftTitles[i],
				Date:          schedule.Dates[i],
				StartTime:     schedule.StartTimes[i],
				EndTime:       schedule.EndTimes[i],
				BreakDuration: schedule.BreakDurations[i],
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
		Get(scheduleSheetId, shiftNamesRange(scheduleSheetName)).
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
			shift.Designation,
			shift.LastUpdated,
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
