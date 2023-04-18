package UpdateAvailability

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Utilities/AvailabilityUtil"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"google.golang.org/api/sheets/v4"
)

func HandleRequest(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (events.APIGatewayProxyResponse, error) {
	updatedEmployeeAvailability, err := updateEmployeeAvailability(employeeId, newEmployeeAvailability)
	if err != nil {
		log.Printf("Error while updating availability: %s", err.Error())
		statusCode := 500
		if err.Error() == SharedConstants.EMPLOYEE_NOT_FOUND_ERROR {
			statusCode = 404
		}
		if err.Error() == AvailabilityConstants.UPDATE_AVAILABILITY_DISABLED_ERROR {
			statusCode = 403
		}
		return events.APIGatewayProxyResponse{
			StatusCode: statusCode,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}
	res, _ := json.Marshal(updatedEmployeeAvailability)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, nil
}

func updateEmployeeAvailability(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (*AvailabilityConstants.EmployeeAvailability, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	canUpdate, err := sheetsService.CanUpdateAvailability()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	if !canUpdate {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, errors.New(AvailabilityConstants.UPDATE_AVAILABILITY_DISABLED_ERROR)
	}

	availabilityTimesheet, err := GetAvailability.GetAvailabilityTimesheet()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	employeeAvailabilityRow, err := GetAvailability.FindRowOfEmployeeAvailability(availabilityTimesheet.Values, employeeId)
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return updateAvailabilityOnRow(employeeAvailabilityRow+AvailabilityConstants.GOOGLESHEETS_ROW_OFFSET, newEmployeeAvailability)
}

func updateAvailabilityOnRow(employeeAvailabilityRow int, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (*AvailabilityConstants.EmployeeAvailability, error) {
	sheetsService := GoogleClient.GetSheetsService()

	updateRange := AvailabilityConstants.GetUpdateAvailabilityRangeFromRow(employeeAvailabilityRow)
	updateValueRange := createUpdatedValueRangeFromNewEmployeeAvailability(newEmployeeAvailability)
	updateResponse, err := sheetsService.Spreadsheets.Values.Update(AvailabilityConstants.AVAILABILITY_SHEET_ID, updateRange, updateValueRange).ValueInputOption("RAW").IncludeValuesInResponse(true).Do()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	return getEmployeeAvailabilityFromUpdateResponse(updateResponse)
}

func createUpdatedValueRangeFromNewEmployeeAvailability(newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) *sheets.ValueRange {
	updatedValues := make([][]interface{}, 0)
	updatedValues = append(
		updatedValues,
		[]interface{}{
			newEmployeeAvailability.Day1.IsAvailable,
			newEmployeeAvailability.Day2.IsAvailable,
			newEmployeeAvailability.Day3.IsAvailable,
			newEmployeeAvailability.Day4.IsAvailable})
	updatedValueRange := sheets.ValueRange{Values: updatedValues}
	return &updatedValueRange
}

func getEmployeeAvailabilityFromUpdateResponse(updateResponse *sheets.UpdateValuesResponse) (*AvailabilityConstants.EmployeeAvailability, error) {
	updateResponseValueRange := updateResponse.UpdatedData
	isAvailableDay1 := updateResponseValueRange.Values[0][0] == "TRUE"
	isAvailableDay2 := updateResponseValueRange.Values[0][1] == "TRUE"
	isAvailableDay3 := updateResponseValueRange.Values[0][2] == "TRUE"
	isAvailableDay4 := updateResponseValueRange.Values[0][3] == "TRUE"

	return AvailabilityUtil.CreateEmployeeAvailability(isAvailableDay1, isAvailableDay2, isAvailableDay3, isAvailableDay4, true)
}
