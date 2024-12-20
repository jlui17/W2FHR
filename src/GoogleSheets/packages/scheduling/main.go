package main

import (
	CognitoGroupAuthorizer "GoogleSheets/packages/common"
	SharedConstants "GoogleSheets/packages/common/Constants"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	scheduling "GoogleSheets/packages/scheduling/handlers"
	"context"
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"log"
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

	if !cognitoGroupAuthorizer.IsAuthorized(employeeInfo.Group) {
		log.Printf("[ERROR] Scheduling - user %s is not authorized to perform scheduling actions.", employeeInfo.Email)
		return events.APIGatewayProxyResponse{
			StatusCode: 403,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errUnauthorized.Error(),
		}, nil
	}

	switch event.HTTPMethod {
	case "GET":
		data, err := scheduling.Get()
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
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 405,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       SharedConstants.ErrInvalidMethod.Error(),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
