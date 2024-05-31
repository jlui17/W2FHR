package VerifyEmployee

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
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
		log.Printf("[ERROR] Auth - email missing")
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
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

	input := &cognitoidentityprovider.ResendConfirmationCodeInput{
		ClientId: aws.String(os.Getenv("COGNITO_CLIENT_ID")),
		Username: aws.String(email), // Assuming the email is used as the username in Cognito
	}
	_, err = svc.ResendConfirmationCode(ctx, input)
	if err != nil {
		log.Printf("[ERROR] Auth - error calling ResendConfirmationCode, err: %s", err)
		status := 500
		errMsg := fmt.Sprintf("Error resending confirmation code: %v", err.Error())

		var invalidEmail *types.InvalidParameterException
		var tmr *types.TooManyRequestsException
		var userNotFound *types.UserNotFoundException
		var limitExceeded *types.LimitExceededException

		if errors.As(err, &invalidEmail) {
			status = 400
			errMsg = "Please enter a valid email."
		} else if errors.As(err, &tmr) {
			status = 400
			errMsg = "You have made too many requests. Please wait a while and try again later."
		} else if errors.As(err, &limitExceeded) {
			status = 400
			errMsg = "You've exceeded the limit for resending codes, try again later."
		} else if errors.As(err, &userNotFound) {
			status = 404
			errMsg = "The an account with the provided email doesn't exist."
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
		Body:       "Confirmation code resent successfully",
	}, nil
}
