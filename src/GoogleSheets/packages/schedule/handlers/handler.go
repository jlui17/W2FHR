package Schedule

import (
	CognitoGroupAuthorizer "GoogleSheets/packages/common"
	SharedConstants "GoogleSheets/packages/common/Constants"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
)

var (
	errUnauthorizedToGetScheduleByTimeRange = SharedConstants.ErrUnauthorized("You are not authorized to get schedule by time range.")

	cognitoGroupAuthorizer = CognitoGroupAuthorizer.New(SharedConstants.SupervisorUserGroup)
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

	shouldGetScheduleByTimeRange, start, end, err := getStartAndEndDatesFromRequest(&employeeInfo, &event)

	var schedule *Timesheet
	if shouldGetScheduleByTimeRange {
		if err != nil {
			log.Printf("[DEBUG] %s - %s", employeeInfo.Id, err.Error())
			return events.APIGatewayProxyResponse{
				StatusCode: 403,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       err.Error(),
			}, nil
		}

		schedule, err = GetByTimeRange(start, end)
		if err != nil {
			log.Printf("[ERROR] Failed to get schedule from %s to %s: %s", start, end, err.Error())
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.ErrInternal.Error(),
			}, nil
		}

		log.Printf("[INFO] Schedule from %s to %s: %v", start, end, schedule)
	} else {
		getUpcomingShifts, getUpcomingShiftsExists := event.QueryStringParameters["upcoming"]
		shouldGetUpcoming := getUpcomingShiftsExists && getUpcomingShifts == "true"
		log.Printf("[INFO] GET Timesheet request (upcoming = %t) for email: %s, employee id: %s, group: %s",
			shouldGetUpcoming,
			employeeInfo.Email,
			employeeInfo.Id,
			employeeInfo.Group,
		)

		schedule, err = Get(employeeInfo.Id, shouldGetUpcoming)
		if err != nil {
			log.Printf("[ERROR] Failed to get timesheet: %s", err.Error())
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.ErrInternal.Error(),
			}, nil
		}

		log.Printf("[INFO] Found shifts for %s: %v", employeeInfo.Id, schedule)
	}

	res, _ := json.Marshal(schedule)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(res),
	}, nil
}

func getStartAndEndDatesFromRequest(e *EmployeeInfo.EmployeeInfo, event *events.APIGatewayProxyRequest) (bool, string, string, error) {
	if !cognitoGroupAuthorizer.IsAuthorized(e.Group) {
		return false, "", "", errUnauthorizedToGetScheduleByTimeRange
	}

	start, startExists := event.QueryStringParameters["start"]
	end := event.QueryStringParameters["end"]
	shouldGetScheduleByTimeRange := startExists
	return shouldGetScheduleByTimeRange, start, end, nil
}
