package GetAvailability

import (
	googleClient "GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Types/AvailabilityConstants"
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aws/aws-lambda-go/events"

	"google.golang.org/api/option"
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
	client := googleClient.GetReadOnlyClient()

	sheetsService, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_SHEET_GET_RANGE

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return findEmployeeAvailabilityFromId(response, employeeId)
}

func findEmployeeAvailabilityFromId(availabilitySheet *sheets.ValueRange, employeeId string) (AvailabilityConstants.EMPLOYEE_AVAILABILITY, error) {
	rowOfEmployeeAvailability, err := FindRowOfEmployeeAvailability(availabilitySheet, employeeId)
	if err != nil {
		return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	isAvailabileDay1 := availabilitySheet.Values[rowOfEmployeeAvailability][6] == "TRUE"
	isAvailabileDay2 := availabilitySheet.Values[rowOfEmployeeAvailability][7] == "TRUE"
	isAvailabileDay3 := availabilitySheet.Values[rowOfEmployeeAvailability][8] == "TRUE"
	isAvailabileDay4 := availabilitySheet.Values[rowOfEmployeeAvailability][9] == "TRUE"

	return AvailabilityConstants.EMPLOYEE_AVAILABILITY{
		Day1: isAvailabileDay1,
		Day2: isAvailabileDay2,
		Day3: isAvailabileDay3,
		Day4: isAvailabileDay4,
	}, nil
}

func FindRowOfEmployeeAvailability(availabilitySheet *sheets.ValueRange, employeeId string) (int, error) {
	for i := 0; i < len(availabilitySheet.Values); i++ {
		if availabilitySheet.Values[i][0] == employeeId {
			return i, nil
		}
	}
	return 0, errors.New(AvailabilityConstants.EMPLOYEE_AVAILABILITY_NOT_FOUND)
}
