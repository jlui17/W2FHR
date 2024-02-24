package UpdateAvailability

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
)

func HandleRequest(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (events.APIGatewayProxyResponse, error) {
	updatedEmployeeAvailability, err := updateEmployeeAvailability(employeeId, newEmployeeAvailability)

	if err != nil {
		log.Printf("[ERROR] Failed to update availability for %s: %s", employeeId, err.Error())
		var statusCode int

		switch err.Error() {
		case AvailabilityConstants.UPDATE_AVAILABILITY_DISABLED_ERROR:
			statusCode = 403
		case SharedConstants.EMPLOYEE_NOT_FOUND_ERROR:
			statusCode = 404
		default:
			statusCode = 500
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
		return &AvailabilityConstants.EmployeeAvailability{}, err
	}

	err = sheetsService.UpdateAvailability(employeeId, newEmployeeAvailability)
	if err != nil {
		return &AvailabilityConstants.EmployeeAvailability{}, err
	}

	return newEmployeeAvailability, nil
}
