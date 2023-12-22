package main

import (
	"GoogleSheets/packages/common/Constants/NewAuthConstants"
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	var signReq NewAuthConstants.SignUpRequest
	err := json.Unmarshal([]byte(event.Body), &signReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       "Invalid request body",
		}, nil
	}
	sess := session.Must(session.NewSession())
	client := cognitoidentityprovider.New(sess)

	signUpInput := (&cognitoidentityprovider.SignUpInput{
		ClientId: aws.String("4kkjr0at3bjoeli3uuprqrthru"),
		Username: aws.String(signReq.Email),
		Password: aws.String(signReq.Password),
	})
	signUpOutput, err := client.SignUp(signUpInput)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error signing up: %v", err.Error()),
		}, nil
	}

	response := NewAuthConstants.SignUpResponse{
		NeedsConfirmation: !(*signUpOutput.UserConfirmed),
	}

	reponseBody, err := json.Marshal(response)

	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       string(reponseBody),
	}, nil

}

func main() {
	lambda.Start(HandleRequest)
}
