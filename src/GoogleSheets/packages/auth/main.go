package main

import (
	GetEmployeeId "GoogleSheets/packages/auth/get"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	email, emailExists := event.PathParameters["email"]
	if !emailExists {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       SharedConstants.INCLUDE_EMAIL_ERROR,
		}, nil
	}

	employeeId, err := GetEmployeeId.HandleRequest(email)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       employeeId,
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
