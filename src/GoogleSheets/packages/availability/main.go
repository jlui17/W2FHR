package main

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	UpdateAvailability "GoogleSheets/packages/availability/update"
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
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
			Body:       "Please include Authorization header in request.",
		}, nil
	}

	employeeId, err := TokenUtil.GetEmployeeIdFromBearerToken(idToken)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       err.Error(),
		}, nil
	}
	requestMethod := event.HTTPMethod

	switch requestMethod {
	case "GET":
		return GetAvailability.HandleRequest(employeeId)
	case "POST":
		newAvailabilityFromRequestBody := event.Body
		newEmployeeAvailability := AvailabilityConstants.EmployeeAvailability{}
		json.Unmarshal([]byte(newAvailabilityFromRequestBody), &newEmployeeAvailability)
		return UpdateAvailability.HandleRequest(employeeId, &newEmployeeAvailability)
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 400,
		Body:       "Not a valid request",
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
