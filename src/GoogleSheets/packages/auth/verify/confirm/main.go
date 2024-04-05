package VerifyEmployeeCode

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var confirmReq AuthConstants.ConfirmCodeRequest
	err := json.Unmarshal([]byte(event.Body), &confirmReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
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
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error confirming code: %v", err),
		}, nil
	}

	response := AuthConstants.VerifyResponse{
		Response: "confirmed",
	}

	reponseBody, err := json.Marshal(response)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(reponseBody),
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
	}, nil
}
