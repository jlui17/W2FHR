package VerifyEmployeeCode

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var confirmReq AuthConstants.ConfirmCodeRequest
	err := json.Unmarshal([]byte(event.Body), &confirmReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Invalid request body",
		}, nil
	}

	sess := session.Must(session.NewSession())
	cognitoClient := cognitoidentityprovider.New(sess)

	confirmInput := &cognitoidentityprovider.ConfirmSignUpInput{
		ClientId:         aws.String(os.Getenv("COGNITO_CLIENT_ID")),
		Username:         aws.String(confirmReq.Email),
		ConfirmationCode: aws.String(confirmReq.Code),
	}

	_, err = cognitoClient.ConfirmSignUp(confirmInput)
	if err != nil {
		log.Printf("[ERROR] Auth - error confirming sign up, err: %s", err)
		status := 500
		errMsg := fmt.Sprintf("Error confirming code: %v", err.Error())

		if awsErr, ok := err.(awserr.Error); ok {
			switch awsErr.Code() {
			case cognitoidentityprovider.ErrCodeExpiredCodeException:
				status = 400
				errMsg = "Your confirmation code has expired. Please request a new one."
			case cognitoidentityprovider.ErrCodeCodeMismatchException:
				status = 400
				errMsg = "Invalid confirmation code. Please try again."
			case cognitoidentityprovider.ErrCodeTooManyFailedAttemptsException:
				status = 400
				errMsg = "Too many failed attempts. Your account has been temporarily locked."
			case cognitoidentityprovider.ErrCodeTooManyRequestsException:
				status = 400
				errMsg = "You have tried too many times, please wait a while and try again later."
			case cognitoidentityprovider.ErrCodeLimitExceededException:
				status = 400
				errMsg = "Request limit exceeded. Please try again later."
			default:
				errMsg = "An unknown error occurred during confirmation."
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
	response := AuthConstants.VerifyResponse{
		Response: "confirmed",
	}
	log.Printf("[INFO] Auth - successfully confirmed up %s", confirmReq.Email)
	reponseBody, _ := json.Marshal(response)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(reponseBody),
	}, nil
}
