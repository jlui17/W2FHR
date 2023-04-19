package GetAvailability

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Utilities/SharedUtil"
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
		if err.Error() == SharedConstants.EMPLOYEE_NOT_FOUND_ERROR {
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
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, nil
}

func getEmployeeAvailability(employeeId string) (*AvailabilityConstants.EmployeeAvailability, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	allAvailability, err := sheetsService.GetAvailability()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return findEmployeeAvailabilityFromId(allAvailability, employeeId)
}

func findEmployeeAvailabilityFromId(availabilityTimesheet [][]interface{}, employeeId string) (*AvailabilityConstants.EmployeeAvailability, error) {
	rowOfEmployeeAvailability, err := FindRowOfEmployeeAvailability(availabilityTimesheet, employeeId)
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	day1ColumnNumber := SharedUtil.GetIndexOfColumn(AvailabilityConstants.AVAILABILITY_SHEET_DAY1_COLUMN)

	isAvailableDay1 := availabilityTimesheet[rowOfEmployeeAvailability][day1ColumnNumber] == "TRUE"
	isAvailableDay2 := availabilityTimesheet[rowOfEmployeeAvailability][day1ColumnNumber+1] == "TRUE"
	isAvailableDay3 := availabilityTimesheet[rowOfEmployeeAvailability][day1ColumnNumber+2] == "TRUE"
	isAvailableDay4 := availabilityTimesheet[rowOfEmployeeAvailability][day1ColumnNumber+3] == "TRUE"

	sheetsService, err := GoogleClient.New()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	canUpdate, err := sheetsService.CanUpdateAvailability()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	dates, err := sheetsService.GetDatesForAvailability()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return &AvailabilityConstants.EmployeeAvailability{
		Day1:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay1, Date: dates[0]},
		Day2:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay2, Date: dates[1]},
		Day3:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay3, Date: dates[2]},
		Day4:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay4, Date: dates[3]},
		CanUpdate: canUpdate,
	}, nil
}

func GetAvailabilityTimesheet() (*sheets.ValueRange, error) {
	sheetsService := GoogleClient.GetSheetsService()

	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_TIMESHEET_GET_RANGE

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return &sheets.ValueRange{}, err
	}

	return response, nil
}

func FindRowOfEmployeeAvailability(availabilityTimesheet [][]interface{}, employeeId string) (int, error) {
	for i := 0; i < len(availabilityTimesheet); i++ {
		if availabilityTimesheet[i][0] == employeeId {
			return i, nil
		}
	}
	return 0, errors.New(SharedConstants.EMPLOYEE_NOT_FOUND_ERROR)
}
