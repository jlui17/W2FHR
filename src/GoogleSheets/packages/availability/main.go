package main

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	"context"

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

	return GetAvailability.HandleRequest(employeeId)
}

func main() {
	lambda.Start(HandleRequest)
}
