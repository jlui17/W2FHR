package ConfirmResetPassword

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"encoding/json"

	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var resetReq AuthConstants.ResetPassword
	err := json.Unmarshal([]byte(event.Body), &resetReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       "Invalid request body",
		}, nil
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		fmt.Println("configuration error,", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
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
		fmt.Println("error calling ConfirmForgotPassword,", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error confirming password reset: %v", err),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       "Password reset confirmed successfully",
	}, nil
}
