package CreateEmployeeID

import (
	GetEmployeeId "GoogleSheets/packages/auth/employee/get"
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

	var signReq AuthConstants.SignUpRequest
	err := json.Unmarshal([]byte(event.Body), &signReq)
	if err != nil {
		log.Print("[ERROR] Auth wrong signReq structure")
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Invalid request body",
		}, nil
	}

	employeeId, err := GetEmployeeId.HandleRequest(signReq.Email)
	if err != nil {
		log.Printf("[ERROR] Auth failed to get employeeId, err: %s", err)
		code := 500
		if err == SharedConstants.ErrEmployeeNotFound {
			code = 401
		}

		return events.APIGatewayProxyResponse{
			StatusCode: code,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       fmt.Sprintf("Error getting employeeId: %v", err.Error()),
		}, nil
	}

	fmt.Printf("[INFO] - email: %s, employee ID: %s", signReq, employeeId)
	cognitoClientID := os.Getenv("COGNITO_CLIENT_ID")
	if cognitoClientID == "" {
		log.Print("[ERROR] Auth - cognito client id not available")
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "COGNITO_CLIENT_ID not set",
		}, nil
	}

	sess := session.Must(session.NewSession())
	client := cognitoidentityprovider.New(sess)
	attributes := []*cognitoidentityprovider.AttributeType{
		{
			Name:  aws.String("custom:employeeId"),
			Value: aws.String(employeeId),
		},
	}
	signUpInput := (&cognitoidentityprovider.SignUpInput{
		ClientId:       aws.String(cognitoClientID),
		Username:       aws.String(signReq.Email),
		Password:       aws.String(signReq.Password),
		UserAttributes: attributes,
	})
	signUpOutput, err := client.SignUp(signUpInput)
	if err != nil {
		log.Printf("[ERROR] Auth - error signing up, err: %s", err)
		status := 500
		errMsg := fmt.Sprintf("Error signing up: %v", err.Error())

		if awsErr, ok := err.(awserr.Error); ok {
			switch awsErr.Code() {
			case cognitoidentityprovider.ErrCodeInvalidPasswordException:
				errMsg = "[ERROR] Auth - password validation not up to date on frontend"
			case cognitoidentityprovider.ErrCodeTooManyRequestsException:
				status = 400
				errMsg = "You have tried to sign up too many times, please wait a while and try again later."
			case cognitoidentityprovider.ErrCodeUsernameExistsException:
				status = 400
				errMsg = "You already have an account. Please log in instead."
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

	response := AuthConstants.SignUpResponse{
		NeedsConfirmation: !(*signUpOutput.UserConfirmed),
	}

	log.Printf("[INFO] Auth - successfully signed up %s", signReq.Email)
	reponseBody, _ := json.Marshal(response)
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(reponseBody),
	}, nil

}
