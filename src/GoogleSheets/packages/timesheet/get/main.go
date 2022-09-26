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

func HandleRequest(employeeId string) (events.APIGatewayProxyResponse, error) {
	masterTimesheet, err := getMasterTimesheet()
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, err
	}

	employeeShifts, err := getTimesheetForEmployee(employeeId, masterTimesheet)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, err
	}
	res, _ := json.Marshal(employeeShifts)

	return events.APIGatewayProxyResponse{
		StatusCode: 201,
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

func getTimesheetForEmployee(employeeId string, masterTimesheet *sheets.ValueRange) (*TimesheetConstants.Timesheet, error) {
	unformattedEmployeeShifts := filterShiftsByEmployeeId(employeeId, masterTimesheet)
	formattedEmployeeShifts := formatEmployeeShifts(unformattedEmployeeShifts)

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

func formatEmployeeShifts(unformattedEmployeeShifts *[][]string) *[]*TimesheetConstants.EmployeeShift {
	formattedEmployeeShifts := []*TimesheetConstants.EmployeeShift{}

	for i := 0; i < len(*unformattedEmployeeShifts); i++ {
		convertedShift := TimesheetUtil.ConvertUnformattedShiftToEmployeeShift((*unformattedEmployeeShifts)[i])
		formattedEmployeeShifts = append(formattedEmployeeShifts, convertedShift)
	}

	return &formattedEmployeeShifts
}
