package ResetPassword

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

func HandleRequest(ctx context.Context, email string) (events.APIGatewayProxyResponse, error) {
	if email == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Email parameter is required",
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

	input := &cognitoidentityprovider.ForgotPasswordInput{
		ClientId: aws.String(os.Getenv("COGNITO_CLIENT_ID")),
		Username: aws.String(email),
	}

	_, err = svc.ForgotPassword(ctx, input)
	if err != nil {
		log.Printf("[ERROR] Auth - error calling ForgotPassword, err: %s", err)
		status := 500
		errMsg := fmt.Sprintf("Error sending password reset: %v", err.Error())

		var invalidEmail *types.UserNotFoundException
		var tmr *types.TooManyRequestsException
		var le *types.LimitExceededException
		if errors.As(err, &invalidEmail) {
			status = 404
			errMsg = "The an account with the provided email doesn't exist."
		} else if errors.As(err, &tmr) || errors.As(err, &le) {
			status = 400
			errMsg = "You have made too many requests. Please wait a while and try again later."
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
		Body:       "Password reset sent successfully",
	}, nil
}
