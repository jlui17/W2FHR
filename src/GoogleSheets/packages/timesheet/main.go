package main

import (
	"GoogleSheets/packages/common/Utilities/TokenUtil"
	GetTimesheet "GoogleSheets/packages/timesheet/get"
	"context"

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

	getUpcomingShifts, getUpcomingShiftsExists := event.QueryStringParameters["upcoming"]
	return GetTimesheet.HandleRequest(employeeId, getUpcomingShiftsExists && getUpcomingShifts == "true")
}

func main() {
	lambda.Start(HandleRequest)
}
