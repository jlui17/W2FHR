package UpdateAvailability

import (
	"GoogleSheets/packages/common/Types/AvailabilityConstants"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
)

func HandleRequest(employeeId string, employeeAvailability *AvailabilityConstants.EMPLOYEE_AVAILABILITY) (events.APIGatewayProxyResponse, error) {
	res, _ := json.Marshal(employeeAvailability)
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       fmt.Sprintf("Update availability, new availability: %s", string(res)),
	}, nil
}
