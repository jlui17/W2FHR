package GetTimesheet

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/TimeService"
	"GoogleSheets/packages/common/Utilities/TimesheetUtil"

	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"google.golang.org/api/sheets/v4"
)

func HandleRequest(employeeId string, getUpcomingShifts bool) (events.APIGatewayProxyResponse, error) {
	masterTimesheet, err := getMasterTimesheet()
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, err
	}

	if getUpcomingShifts {
		employeeShifts, err := getUpcomingShiftsForEmployee(employeeId, masterTimesheet)
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			}, err
		}
		res, _ := json.Marshal(employeeShifts)

		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       fmt.Sprint(string(res)),
		}, err
	}

	employeeShifts, err := getShiftsForEmployee(employeeId, masterTimesheet)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, err
	}
	res, _ := json.Marshal(employeeShifts)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, err
}

func getMasterTimesheet() (*sheets.ValueRange, error) {
	sheetsService, err := GoogleClient.GetReadOnlyService()
	if err != nil {
		return &sheets.ValueRange{}, err
	}

	sheetId := TimesheetConstants.TIMESHEET_SHEET_ID
	readRange := fmt.Sprintf("%s!%s", TimesheetConstants.MASTER_TIMESHEET_SHEET_NAME, TimesheetConstants.TIMESHEET_GET_RANGE)

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return &sheets.ValueRange{}, err
	}

	return response, nil
}

func getUpcomingShiftsForEmployee(employeeId string, masterTimesheet *sheets.ValueRange) (*TimesheetConstants.Timesheet, error) {
	upcomingShifts := filterForUpcomingShifts(masterTimesheet)
	unformattedEmployeeShifts := filterShiftsByEmployeeId(employeeId, upcomingShifts)
	formattedEmployeeShifts := TimesheetUtil.FormatEmployeeShifts(unformattedEmployeeShifts)

	viewingDates, err := TimeService.GetDatesForSettingAvailability(TimesheetConstants.TIMESHEET_VIEWING_DATE_READ_RANGE)
	if err != nil {
		return TimesheetConstants.DEFAULT_TIMESHEET, err
	}

	return &TimesheetConstants.Timesheet{
		Shifts:       formattedEmployeeShifts,
		ViewingDates: viewingDates,
	}, nil
}

func getShiftsForEmployee(employeeId string, masterTimesheet *sheets.ValueRange) (*TimesheetConstants.Timesheet, error) {
	unformattedEmployeeShifts := filterShiftsByEmployeeId(employeeId, masterTimesheet)
	formattedEmployeeShifts := TimesheetUtil.FormatEmployeeShifts(unformattedEmployeeShifts)

	viewingDates, err := TimeService.GetDatesForSettingAvailability(TimesheetConstants.TIMESHEET_VIEWING_DATE_READ_RANGE)
	if err != nil {
		return TimesheetConstants.DEFAULT_TIMESHEET, err
	}

	return &TimesheetConstants.Timesheet{
		Shifts:       formattedEmployeeShifts,
		ViewingDates: viewingDates,
	}, nil
}

func filterShiftsByEmployeeId(employeeId string, masterTimesheet *sheets.ValueRange) *[][]string {
	employeeShifts := [][]string{}

	for i := 0; i < len(masterTimesheet.Values); i++ {
		if masterTimesheet.Values[i][0] == "" {
			break
		}

		isThisEmployeesShift := masterTimesheet.Values[i][2].(string) == employeeId
		if isThisEmployeesShift {
			convertedEmployeeShift := TimesheetUtil.ConvertShiftInterfaceSliceToStringSlice(&masterTimesheet.Values[i])
			employeeShifts = append(employeeShifts, convertedEmployeeShift)
		}
	}

	return &employeeShifts
}

func filterForUpcomingShifts(masterTimesheet *sheets.ValueRange) *sheets.ValueRange {
	upcomingShifts := make([][]interface{}, 0)
	today := TimeService.GetToday()

	for i := len(masterTimesheet.Values) - 1; i > -1; i-- {
		dateCol := SharedConstants.LETTER_TO_NUMBER_MAP["D"]
		shiftDate := masterTimesheet.Values[i][dateCol].(string)
		convertedDate := TimeService.ConvertDateToTime(shiftDate)

		isThisShiftAfterToday := convertedDate.After(*today) || convertedDate.Equal(*today)
		if !isThisShiftAfterToday {
			break
		}

		upcomingShifts = append(upcomingShifts, masterTimesheet.Values[i])
	}

	for i, j := 0, len(upcomingShifts)-1; i < j; i, j = i+1, j-1 { // reverse
		upcomingShifts[i], upcomingShifts[j] = upcomingShifts[j], upcomingShifts[i]
	}
	return &sheets.ValueRange{
		Values: upcomingShifts,
	}
}
