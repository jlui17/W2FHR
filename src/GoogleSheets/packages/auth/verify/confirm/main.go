package VerifyEmployeeCode

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var req AuthConstants.ConfirmCodeRequest
	err := json.Unmarshal([]byte(event.Body), &req)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
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
	cognitoClient := cognitoidentityprovider.NewFromConfig(cfg)

	clientId := os.Getenv("COGNITO_CLIENT_ID")
	confirmInput := &cognitoidentityprovider.ConfirmSignUpInput{
		ClientId:         &clientId,
		Username:         &req.Email,
		ConfirmationCode: &req.Code,
	}

	_, err = cognitoClient.ConfirmSignUp(ctx, confirmInput)
	if err != nil {
		log.Printf("[ERROR] Auth - error confirming sign up, err: %s", err)
		status := 500
		errMsg := fmt.Sprintf("Error confirming code: %v", err.Error())

		var expiredCodeErr *types.ExpiredCodeException
		var codeMismatchErr *types.CodeMismatchException
		var tooManyFailedAttemptsErr *types.TooManyFailedAttemptsException
		var tooManyRequestsErr *types.TooManyRequestsException
		var limitExceededErr *types.LimitExceededException
		if errors.As(err, &expiredCodeErr) {
			status = 400
			errMsg = "Your confirmation code has expired. Please request a new one."
		} else if errors.As(err, &codeMismatchErr) {
			status = 400
			errMsg = "Invalid confirmation code. Please try again."
		} else if errors.As(err, &tooManyFailedAttemptsErr) {
			status = 400
			errMsg = "Too many failed attempts. Your account has been temporarily locked."
		} else if errors.As(err, &tooManyRequestsErr) {
			status = 400
			errMsg = "You have tried too many times, please wait a while and try again later."
		} else if errors.As(err, &limitExceededErr) {
			status = 400
			errMsg = "Request limit exceeded. Please try again later."
		}

		if status == 500 {
			log.Printf("[ERROR] Auth: %v", errMsg)
			errMsg = "Internal service error"
		}
		return events.APIGatewayProxyResponse{
			StatusCode: status,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errMsg,
		}, nil
	}
	response := AuthConstants.VerifyResponse{
		Response: "confirmed",
	}
	log.Printf("[INFO] Auth - successfully confirmed up %s", req.Email)
	reponseBody, _ := json.Marshal(response)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(reponseBody),
	}, nil
}
