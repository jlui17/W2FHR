package main

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	UpdateAvailability "GoogleSheets/packages/availability/update"
	"GoogleSheets/packages/common/Types/AvailabilityConstants"
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	employeeId, exists := event.PathParameters["employeeId"]
	if !exists {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       "Please include employee id in request.",
		}, nil
	}

	requestMethod := event.HTTPMethod

	switch requestMethod {
	case "GET":
		return GetAvailability.HandleRequest(employeeId)
	case "POST":
		availabilityFromRequestBody := event.Body
		employeeAvailability := AvailabilityConstants.EMPLOYEE_AVAILABILITY{}
		json.Unmarshal([]byte(availabilityFromRequestBody), &employeeAvailability)
		return UpdateAvailability.HandleRequest(employeeId, &employeeAvailability)
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 400,
		Body:       "Not a valid request",
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
