package ConfirmResetPassword

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"encoding/json"
	"log"

	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go/aws/awserr"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var resetReq AuthConstants.ResetPassword
	err := json.Unmarshal([]byte(event.Body), &resetReq)
	if err != nil {
		log.Printf(
			"[ERROR] Auth - reset password json mismatch\nexpected: %v\nactual: %s",
			AuthConstants.ResetPassword{Email: ".", Password: ".", Code: "."},
			event.Body,
		)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Invalid request body",
		}, nil
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		fmt.Println("configuration error,", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Internal server error",
		}, nil
	}

	svc := cognitoidentityprovider.NewFromConfig(cfg)

	input := &cognitoidentityprovider.ConfirmForgotPasswordInput{
		ClientId:         aws.String(os.Getenv("COGNITO_CLIENT_ID")),
		Username:         aws.String(resetReq.Email),
		ConfirmationCode: aws.String(resetReq.Code),
		Password:         aws.String(resetReq.Password),
	}

	_, err = svc.ConfirmForgotPassword(ctx, input)
	if err != nil {
		log.Printf("[ERROR] Auth - error calling ConfirmForgotPassword, err: %s", err)
		status := 500
		errMsg := fmt.Sprintf("Error confirming password reset: %v", err.Error())

		if awsErr, ok := err.(awserr.Error); ok {
			switch awsErr.Code() {
			case "InvalidParameterException":
				status = 400
				errMsg = "(InvalidParameterException) The provided confirmation code is incorrect or expired."
			case "TooManyRequestsException":
				status = 400
				errMsg = "(TooManyRequestsException) You have made too many requests. Please wait a while and try again later."
			}
		}

		if status == 500 {
			log.Printf("[ERROR] Auth: %v", errMsg)
		}
		return events.APIGatewayProxyResponse{
			StatusCode: status,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errMsg,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       "Password reset confirmed successfully",
	}, nil
}
