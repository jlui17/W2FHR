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

	employeeShifts, err := getShiftsForEmployee(employeeId, masterTimesheet, getUpcomingShifts)
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

func getShiftsForEmployee(employeeId string, masterTimesheet *sheets.ValueRange, getUpcomingShifts bool) (*TimesheetConstants.Timesheet, error) {
	shiftsToFilter := masterTimesheet.Values
	if getUpcomingShifts {
		shiftsToFilter = filterForUpcomingShifts(masterTimesheet)
	}

	unformattedEmployeeShifts := filterShiftsByEmployeeId(employeeId, shiftsToFilter)
	formattedEmployeeShifts := TimesheetUtil.FormatEmployeeShifts(unformattedEmployeeShifts)

	return &TimesheetConstants.Timesheet{
		Shifts: formattedEmployeeShifts,
	}, nil
}

func filterShiftsByEmployeeId(employeeId string, masterTimesheet [][]interface{}) *[][]string {
	employeeShifts := [][]string{}

	for _, shift := range masterTimesheet {
		if shift[0] == "" {
			break
		}

		employeeIdColumn := SharedConstants.LETTER_TO_NUMBER_MAP[TimesheetConstants.EMPLOYEE_ID_COLUMN]
		isThisEmployeesShift := shift[employeeIdColumn].(string) == employeeId
		if isThisEmployeesShift {
			convertedEmployeeShift := TimesheetUtil.ConvertShiftInterfaceSliceToStringSlice(shift)
			employeeShifts = append(employeeShifts, convertedEmployeeShift)
		}
	}

	return &employeeShifts
}

func filterForUpcomingShifts(masterTimesheet *sheets.ValueRange) [][]interface{} {
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
	return upcomingShifts
}
