package main

import (
	UpdateAvailability "GoogleSheets/packages/availability/update/helpers"
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Utilities/TokenUtil"
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	idToken, exists := event.Headers["Authorization"]
	if !exists {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       SharedConstants.INCLUDE_AUTH_HEADER_ERROR,
		}, nil
	}

	GoogleClient.ConnectSheetsServiceIfNecessary()
	employeeId, err := TokenUtil.GetEmployeeIdFromBearerToken(idToken)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       err.Error(),
		}, nil
	}

	newAvailabilityFromRequestBody := event.Body
	newEmployeeAvailability := AvailabilityConstants.EmployeeAvailability{}
	json.Unmarshal([]byte(newAvailabilityFromRequestBody), &newEmployeeAvailability)

	return UpdateAvailability.HandleRequest(employeeId, &newEmployeeAvailability)
}

func main() {
	lambda.Start(HandleRequest)
}
