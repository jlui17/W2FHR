package UpdateAvailability

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
)

func HandleRequest(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (events.APIGatewayProxyResponse, error) {
	updatedEmployeeAvailability, err := updateEmployeeAvailability(employeeId, newEmployeeAvailability)
	if err != nil {
		log.Printf("[ERROR] Availability updating: %s", err.Error())
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
	log.Printf("[INFO] Availability updated for %s: %s", employeeId, fmt.Sprint(string(res)))
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

	return sheetsService.UpdateAvailabilityOnRow(employeeAvailabilityRow+AvailabilityConstants.GOOGLESHEETS_ROW_OFFSET, newEmployeeAvailability)
}
