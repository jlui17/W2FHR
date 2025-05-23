package Scheduling

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
	errUnauthorized = SharedConstants.ErrUnauthorized("You are not authorized to perform scheduling actions.")

	cognitoGroupAuthorizer = CognitoGroupAuthorizer.New(SharedConstants.ManagerUserGroup)
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

	if !cognitoGroupAuthorizer.IsAuthorizedForScheduling(&employeeInfo) {
		log.Printf("[ERROR] Scheduling - user %s (%s) is not authorized to perform scheduling actions.", employeeInfo.Email, employeeInfo.Id)
		return events.APIGatewayProxyResponse{
			StatusCode: 403,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errUnauthorized.Error(),
		}, nil
	}

	switch event.HTTPMethod {
	case "GET":
		data, err := Get()
		if err != nil {
			log.Printf("[ERROR] Scheduling - failed to get scheduling data: %v", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.ErrInternal.Error(),
			}, nil
		}

		res, _ := json.Marshal(data)
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       string(res),
		}, nil

	case "PUT":
		var req UpdateSchedulingRequest
		err := json.Unmarshal([]byte(event.Body), &req)
		if err != nil {
			log.Printf("[ERROR] Scheduling - failed to unmarshal request body: %v", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 400,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.ErrInvalidRequest.Error(),
			}, nil
		}

		updatedData, err := Update(req)
		if err != nil {
			log.Printf("[ERROR] Scheduling - failed to update scheduling data: %v", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.ErrInternal.Error(),
			}, nil
		}

		res, _ := json.Marshal(updatedData)
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       string(res),
		}, nil

	case "POST":
		var req NewScheduleRequest
		err := json.Unmarshal([]byte(event.Body), &req)
		if err != nil {
			log.Printf("[ERROR] Scheduling - failed to unmarshal request body: %v", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 400,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.ErrInvalidRequest.Error(),
			}, nil
		}

		err = New(req)
		if err != nil {
			log.Printf("[ERROR] Scheduling - failed to create new schedule: %v", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.ErrInternal.Error(),
			}, nil
		}

		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 405,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       SharedConstants.ErrInvalidMethod.Error(),
	}, nil
}
