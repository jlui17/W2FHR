package CreateEmployeeID

import (
	GetEmployeeId "GoogleSheets/packages/auth/employee/get"
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

	var signReq AuthConstants.SignUpRequest
	err := json.Unmarshal([]byte(event.Body), &signReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       "Invalid request body",
		}, nil
	}

	employeeId, err := GetEmployeeId.HandleRequest(signReq.Email)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error getting employeeId: %v", err.Error()),
		}, nil
	}

	fmt.Printf("[INFO] - email: %s, employee ID: %s", signReq, employeeId)
	cognitoClientID := os.Getenv("COGNITO_CLIENT_ID")
	if cognitoClientID == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
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
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error signing up: %v", err.Error()),
		}, nil
	}

	response := AuthConstants.SignUpResponse{
		NeedsConfirmation: !(*signUpOutput.UserConfirmed),
	}

	reponseBody, err := json.Marshal(response)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       "Error marshalling response",
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       string(reponseBody),
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
	}, nil

}
