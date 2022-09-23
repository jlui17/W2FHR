package GetAvailability

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Utilities/AvailabilityUtil"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aws/aws-lambda-go/events"

	"google.golang.org/api/sheets/v4"
)

func HandleRequest(employeeId string) (events.APIGatewayProxyResponse, error) {
	employeeAvailability, err := getEmployeeAvailability(employeeId)

	if err != nil {
		statusCode := 500
		if err.Error() == AvailabilityConstants.EMPLOYEE_AVAILABILITY_NOT_FOUND {
			statusCode = 404
		}

		return events.APIGatewayProxyResponse{
			StatusCode: statusCode,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}

	res, _ := json.Marshal(employeeAvailability)
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, nil
}

func getEmployeeAvailability(employeeId string) (*AvailabilityConstants.EmployeeAvailability, error) {
	availabilityTimesheet, err := GetAvailabilityTimesheet()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return findEmployeeAvailabilityFromId(availabilityTimesheet, employeeId)
}

func findEmployeeAvailabilityFromId(availabilityTimesheet *sheets.ValueRange, employeeId string) (*AvailabilityConstants.EmployeeAvailability, error) {
	rowOfEmployeeAvailability, err := FindRowOfEmployeeAvailability(availabilityTimesheet, employeeId)
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	day1ColumnNumber := SharedConstants.LETTER_TO_NUMBER_MAP[AvailabilityConstants.AVAILABILITY_SHEET_DAY1_COLUMN]

	isAvailableDay1 := availabilityTimesheet.Values[rowOfEmployeeAvailability][day1ColumnNumber] == "TRUE"
	isAvailableDay2 := availabilityTimesheet.Values[rowOfEmployeeAvailability][day1ColumnNumber+1] == "TRUE"
	isAvailableDay3 := availabilityTimesheet.Values[rowOfEmployeeAvailability][day1ColumnNumber+2] == "TRUE"
	isAvailableDay4 := availabilityTimesheet.Values[rowOfEmployeeAvailability][day1ColumnNumber+3] == "TRUE"

	return AvailabilityUtil.CreateEmployeeAvailability(isAvailableDay1, isAvailableDay2, isAvailableDay3, isAvailableDay4)
}

func GetAvailabilityTimesheet() (*sheets.ValueRange, error) {
	sheetsService, err := GoogleClient.GetReadOnlyService()
	if err != nil {
		return &sheets.ValueRange{}, err
	}

	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_TIMESHEET_GET_RANGE

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return &sheets.ValueRange{}, err
	}

	return response, nil
}

func FindRowOfEmployeeAvailability(availabilityTimesheet *sheets.ValueRange, employeeId string) (int, error) {
	for i := 0; i < len(availabilityTimesheet.Values); i++ {
		if availabilityTimesheet.Values[i][0] == employeeId {
			return i, nil
		}
	}
	return 0, errors.New(AvailabilityConstants.EMPLOYEE_AVAILABILITY_NOT_FOUND)
}
