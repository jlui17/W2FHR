package main

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Utilities/EmployeeInfo"
	GetTimesheet "GoogleSheets/packages/timesheet/get"
	"context"
	"log"

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
	employeeInfo, err := EmployeeInfo.New(idToken)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       err.Error(),
		}, nil
	}

	getUpcomingShifts, getUpcomingShiftsExists := event.QueryStringParameters["upcoming"]
	shouldGetUpcoming := getUpcomingShiftsExists && getUpcomingShifts == "true"
	log.Printf("[INFO] GET Timesheet request (upcoming = %t) for email: %s, employee id: %s",
		shouldGetUpcoming,
		employeeInfo.GetEmail(),
		employeeInfo.GetEmployeeId(),
	)
	return GetTimesheet.HandleRequest(employeeInfo.GetEmployeeId(), shouldGetUpcoming)
}

func main() {
	lambda.Start(HandleRequest)
}
