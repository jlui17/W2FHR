package main

import (
	GetEmployeeId "GoogleSheets/packages/auth/get"
	UpdateEmployeeID "GoogleSheets/packages/auth/update"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	switch event.HTTPMethod {
	case "GET":
		email, emailExists := event.PathParameters["email"]
		if !emailExists {
			return events.APIGatewayProxyResponse{
				StatusCode: 401,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       SharedConstants.INCLUDE_EMAIL_ERROR,
			}, nil
		}
		log.Printf("[INFO] Finding employeeId for email: %s", email)

		GoogleClient.ConnectSheetsServiceIfNecessary()
		employeeId, err := GetEmployeeId.HandleRequest(email)
		if err != nil {
			log.Printf("[ERROR] %s", err.Error())
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
	case "POST":

		return UpdateEmployeeID.HandleRequest(ctx, event)
	default:
		return events.APIGatewayProxyResponse{
			StatusCode: 501,
		}, nil
	}

}

func main() {
	lambda.Start(HandleRequest)
}
