package main

import (
	CreateEmployeeID "GoogleSheets/packages/auth/employee/create"
	GetEmployeeId "GoogleSheets/packages/auth/employee/get"
	ConfirmEmployee "GoogleSheets/packages/auth/verify/confirm"
	VerifyEmployee "GoogleSheets/packages/auth/verify/send"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"context"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	switch event.HTTPMethod {

	case http.MethodGet:
		switch event.Resource {
		case "auth/employee/{email}":
			email, emailExists := event.PathParameters["email"]
			if !emailExists {
				return events.APIGatewayProxysResponse{
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
		case "/auth/verify":
			email := event.QueryStringParameters["email"]
			if email == "" {
				return events.APIGatewayProxyResponse{
					StatusCode: 400,
					Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
					Body:       "Email query parameter is required",
				}, nil
			}
			log.Printf("[INFO] Sending verification code to email: %s", email)

			response, err := VerifyEmployee.HandleRequest(ctx, email)
			if err != nil {
				log.Printf("[ERROR] %s", err.Error())
				return events.APIGatewayProxyResponse{
					StatusCode: 500,
					Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
					Body:       err.Error(),
				}, nil
			}
			return response, nil
		default:
			return events.APIGatewayProxyResponse{
				StatusCode: 501,
			}, nil
		}

	case http.MethodPost:
		switch event.Resource {
		case "/auth/employee":
			return CreateEmployeeID.HandleRequest(ctx, event)
		case "/auth/verify":
			return ConfirmEmployee.HandleRequest(ctx, event)
		default:
			return events.APIGatewayProxyResponse{
				StatusCode: 501,
			}, nil
		}
	default:
		return events.APIGatewayProxyResponse{
			StatusCode: 501,
		}, nil
	}

}

func main() {
	lambda.Start(HandleRequest)
}
