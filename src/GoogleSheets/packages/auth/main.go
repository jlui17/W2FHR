package main

import (
	CreateEmployeeID "GoogleSheets/packages/auth/employee/create"
	GetEmployeeId "GoogleSheets/packages/auth/employee/get"
	LoginEmployee "GoogleSheets/packages/auth/login"
	ConfirmResetPassword "GoogleSheets/packages/auth/password/confirm"
	ResetPassword "GoogleSheets/packages/auth/password/send"

	ConfirmEmployee "GoogleSheets/packages/auth/verify/confirm"
	VerifyEmployee "GoogleSheets/packages/auth/verify/send"
	"GoogleSheets/packages/common/Constants/SharedConstants"
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
				return events.APIGatewayProxyResponse{
					StatusCode: 401,
					Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
					Body:       SharedConstants.INCLUDE_EMAIL_ERROR,
				}, nil
			}
			log.Printf("[INFO] Finding employeeId for email: %s", email)

			employeeId, err := GetEmployeeId.HandleRequest(email)
			if err != nil {
				log.Printf("[ERROR] Auth - error getting employee id for %s: %s", email, err.Error())
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
				log.Printf("[ERROR] Auth - error verifying %s: %s", email, err.Error())
				return events.APIGatewayProxyResponse{
					StatusCode: 500,
					Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
					Body:       err.Error(),
				}, nil
			}
			return response, nil
		case "/auth/password":
			email := event.QueryStringParameters["email"]
			if email == "" {
				return events.APIGatewayProxyResponse{
					StatusCode: 400,
					Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
					Body:       "Email query parameter is required.",
				}, nil
			}
			log.Printf("[INFO] Sending password reset code to email: %s", email)

			response, err := ResetPassword.HandleRequest(ctx, email)
			if err != nil {
				log.Printf("[ERROR] Auth - error sending password reset code to %s, %s", email, err.Error())
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
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			}, nil
		}

	case http.MethodPost:
		switch event.Resource {
		case "/auth/employee":
			return CreateEmployeeID.HandleRequest(ctx, event)
		case "/auth/verify":
			return ConfirmEmployee.HandleRequest(ctx, event)
		case "/auth/login":
			return LoginEmployee.HandleRequest(ctx, event)
		case "/auth/password":
			return ConfirmResetPassword.HandleRequest(ctx, event)
		default:
			return events.APIGatewayProxyResponse{
				StatusCode: 501,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			}, nil
		}
	default:
		return events.APIGatewayProxyResponse{
			StatusCode: 501,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, nil
	}

}

func main() {
	lambda.Start(HandleRequest)
}
