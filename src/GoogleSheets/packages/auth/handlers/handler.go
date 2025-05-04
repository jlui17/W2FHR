package Authorization

import (
	Authorization "GoogleSheets/packages/auth/employee"
	LoginEmployee "GoogleSheets/packages/auth/login"
	ConfirmResetPassword "GoogleSheets/packages/auth/password/confirm"
	ResetPassword "GoogleSheets/packages/auth/password/send"

	ConfirmEmployee "GoogleSheets/packages/auth/verify/confirm"
	VerifyEmployee "GoogleSheets/packages/auth/verify/send"
	SharedConstants "GoogleSheets/packages/common/Constants"
	"context"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	switch event.HTTPMethod {
	case http.MethodPost:
		switch event.Resource {
		case "/auth/employee":
			return Authorization.SignUpEmployee(ctx, event)
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
		case "/auth/login":
			return LoginEmployee.HandleRequest(ctx, event)
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

	case http.MethodPut:
		switch event.Resource {
		case "/auth/verify":
			return ConfirmEmployee.HandleRequest(ctx, event)
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
