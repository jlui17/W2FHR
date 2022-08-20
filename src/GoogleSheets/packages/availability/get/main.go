package GetAvailability

import (
	googleClient "GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Types/AvailabilityConstants"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aws/aws-lambda-go/events"

	"google.golang.org/api/sheets/v4"
)

func HandleRequest(employeeId string) (events.APIGatewayProxyResponse, error) {
	employeeAvailability, err := getEmployeeAvailability(employeeId)

	if err != nil {
		if err.Error() == AvailabilityConstants.EMPLOYEE_AVAILABILITY_NOT_FOUND {
			return events.APIGatewayProxyResponse{
				StatusCode: 404,
				Body:       fmt.Sprintf("Name not found for employee id %s", employeeId),
			}, nil
		}

		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}, nil
	}

	res, _ := json.Marshal(employeeAvailability)
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       fmt.Sprint(string(res)),
	}, nil
}

func getEmployeeAvailability(employeeId string) (AvailabilityConstants.EMPLOYEE_AVAILABILITY, error) {
	availabilityTimesheet, err := GetAvailabilityTimesheet()
	if err != nil {
		return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return findEmployeeAvailabilityFromId(availabilityTimesheet, employeeId)
}

func findEmployeeAvailabilityFromId(availabilityTimesheet *sheets.ValueRange, employeeId string) (AvailabilityConstants.EMPLOYEE_AVAILABILITY, error) {
	rowOfEmployeeAvailability, err := FindRowOfEmployeeAvailability(availabilityTimesheet, employeeId)
	if err != nil {
		return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	isAvailabileDay1 := availabilityTimesheet.Values[rowOfEmployeeAvailability][6] == "TRUE"
	isAvailabileDay2 := availabilityTimesheet.Values[rowOfEmployeeAvailability][7] == "TRUE"
	isAvailabileDay3 := availabilityTimesheet.Values[rowOfEmployeeAvailability][8] == "TRUE"
	isAvailabileDay4 := availabilityTimesheet.Values[rowOfEmployeeAvailability][9] == "TRUE"

	return AvailabilityConstants.EMPLOYEE_AVAILABILITY{
		Day1: isAvailabileDay1,
		Day2: isAvailabileDay2,
		Day3: isAvailabileDay3,
		Day4: isAvailabileDay4,
	}, nil
}

func GetAvailabilityTimesheet() (*sheets.ValueRange, error) {
	sheetsService, err := googleClient.GetReadOnlyService()
	if err != nil {
		return &sheets.ValueRange{}, err
	}

	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_SHEET_GET_RANGE

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
