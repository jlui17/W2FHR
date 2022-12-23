package main

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	GetTimesheet "GoogleSheets/packages/timesheet/get"
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	employeeId, employeeIdExists := event.PathParameters["employeeId"]
	if !employeeIdExists {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Please include employee id in request.",
		}, nil
	}

	getUpcomingShifts, getUpcomingShiftsExists := event.QueryStringParameters["upcoming"]
	return GetTimesheet.HandleRequest(employeeId, getUpcomingShiftsExists && getUpcomingShifts == "true")
}

func main() {
	lambda.Start(HandleRequest)
}
