package UpdateAvailability

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"google.golang.org/api/sheets/v4"
)

func HandleRequest(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (events.APIGatewayProxyResponse, error) {
	updatedEmployeeAvailability, err := updateEmployeeAvailability(employeeId, newEmployeeAvailability)
	if err != nil {
		statusCode := 500
		if err.Error() == AvailabilityConstants.EMPLOYEE_AVAILABILITY_NOT_FOUND {
			statusCode = 404
		}
		return events.APIGatewayProxyResponse{
			StatusCode: statusCode,
			Headers:    AvailabilityConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}
	res, _ := json.Marshal(updatedEmployeeAvailability)
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Headers:    AvailabilityConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, nil
}

func updateEmployeeAvailability(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (*AvailabilityConstants.EmployeeAvailability, error) {
	availabilityTimesheet, err := GetAvailability.GetAvailabilityTimesheet()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	employeeAvailabilityRow, err := GetAvailability.FindRowOfEmployeeAvailability(availabilityTimesheet, employeeId)
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return updateAvailabilityOnRow(employeeAvailabilityRow+AvailabilityConstants.GOOGLESHEETS_ROW_OFFSET, newEmployeeAvailability)
}

func updateAvailabilityOnRow(employeeAvailabilityRow int, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (*AvailabilityConstants.EmployeeAvailability, error) {
	sheetsService, err := GoogleClient.GetReadWriteService()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	updateRange := AvailabilityConstants.GetUpdateAvailabilityRangeFromRow(employeeAvailabilityRow)
	updateValueRange := createUpdatedValueRangeFromNewEmployeeAvailability(newEmployeeAvailability)
	updateResponse, err := sheetsService.Spreadsheets.Values.Update(AvailabilityConstants.AVAILABILITY_SHEET_ID, updateRange, updateValueRange).ValueInputOption("RAW").IncludeValuesInResponse(true).Do()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	updatedEmployeeAvailability := createEmployeeAvailabilityFromUpdateResponse(updateResponse)
	return updatedEmployeeAvailability, nil
}

func createUpdatedValueRangeFromNewEmployeeAvailability(newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) *sheets.ValueRange {
	updatedValues := make([][]interface{}, 0)
	updatedValues = append(
		updatedValues,
		[]interface{}{
			newEmployeeAvailability.Day1,
			newEmployeeAvailability.Day2,
			newEmployeeAvailability.Day3,
			newEmployeeAvailability.Day4})
	updatedValueRange := sheets.ValueRange{Values: updatedValues}
	return &updatedValueRange
}

func createEmployeeAvailabilityFromUpdateResponse(updateResponse *sheets.UpdateValuesResponse) *AvailabilityConstants.EmployeeAvailability {
	updateResponseValueRange := updateResponse.UpdatedData
	isAvailabileDay1 := updateResponseValueRange.Values[0][0] == "TRUE"
	isAvailabileDay2 := updateResponseValueRange.Values[0][1] == "TRUE"
	isAvailabileDay3 := updateResponseValueRange.Values[0][2] == "TRUE"
	isAvailabileDay4 := updateResponseValueRange.Values[0][3] == "TRUE"

	return &AvailabilityConstants.EmployeeAvailability{
		Day1: isAvailabileDay1,
		Day2: isAvailabileDay2,
		Day3: isAvailabileDay3,
		Day4: isAvailabileDay4,
	}
}
