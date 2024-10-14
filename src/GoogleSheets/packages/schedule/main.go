package main

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/Utilities/EmployeeInfo"
	"GoogleSheets/packages/schedule/Schedule"
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	idToken, exists := event.Headers["Authorization"]
	if !exists {
		log.Println("[ERROR] Schedule - ID Token doesn't exist in header.")
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       SharedConstants.INCLUDE_AUTH_HEADER_ERROR,
		}, nil
	}

	employeeInfo, err := EmployeeInfo.New(idToken)
	if err != nil {
		log.Printf("[ERROR] Schedule - failed to get employee info from ID token: %v, err: %s", idToken, err)
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}

	getUpcomingShifts, getUpcomingShiftsExists := event.QueryStringParameters["upcoming"]
	shouldGetUpcoming := getUpcomingShiftsExists && getUpcomingShifts == "true"
	log.Printf("[INFO] GET Timesheet request (upcoming = %t) for email: %s, employee id: %s",
		shouldGetUpcoming,
		employeeInfo.Email,
		employeeInfo.Id,
	)

	schedule, err := Schedule.Get(employeeInfo.Id, shouldGetUpcoming)
	if err != nil {
		log.Printf("[ERROR] Failed to get timesheet: %s", err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}

	log.Printf("[INFO] Found shifts for %s: %v", employeeInfo.Id, schedule)
	res, _ := json.Marshal(schedule)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(res),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
