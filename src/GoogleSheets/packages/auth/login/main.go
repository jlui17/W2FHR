package LoginEmployee

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"fmt"
	"log"

	"context"
	"encoding/json"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var loginReq AuthConstants.LoginRequest
	err := json.Unmarshal([]byte(event.Body), &loginReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Invalid request body",
		}, nil
	}

	sess := session.Must(session.NewSession())
	cognitoClient := cognitoidentityprovider.New(sess)

	authInput := &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: aws.String("USER_PASSWORD_AUTH"),
		AuthParameters: map[string]*string{
			"USERNAME": aws.String(loginReq.Email),
			"PASSWORD": aws.String(loginReq.Password),
		},
		ClientId: aws.String(os.Getenv("COGNITO_CLIENT_ID")),
	}

	authResp, err := cognitoClient.InitiateAuth(authInput)
	if err != nil {
		log.Printf("[ERROR] Auth - error initiating authentication, err: %s", err)

		statusCode := 500
		errMsg := fmt.Sprintf("An error occurred during authentication: %v", err.Error())

		if awsErr, ok := err.(awserr.Error); ok {
			switch awsErr.Code() {
			case cognitoidentityprovider.ErrCodeUserNotFoundException:
				statusCode = 404
				errMsg = "User does not exist."
			case cognitoidentityprovider.ErrCodeNotAuthorizedException:
				statusCode = 400
				errMsg = "Incorrect username or password."
			case cognitoidentityprovider.ErrCodeUserNotConfirmedException:
				statusCode = 400
				errMsg = "User is not confirmed."
			case cognitoidentityprovider.ErrCodePasswordResetRequiredException:
				statusCode = 400
				errMsg = "Password reset required for the user."
			case cognitoidentityprovider.ErrCodeTooManyRequestsException:
				statusCode = 400
				errMsg = "Too many requests. Please try again later."
			}
		}

		return events.APIGatewayProxyResponse{
			StatusCode: statusCode,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errMsg,
		}, nil
	}
	authResultJSON, err := json.Marshal(authResp.AuthenticationResult)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Error marshalling response",
		}, nil
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(authResultJSON),
	}, nil
}
