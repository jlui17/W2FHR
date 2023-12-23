package CreateEmployeeID

import (
	GetEmployeeId "GoogleSheets/packages/auth/get"
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/GoogleClient"
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

	err = GoogleClient.ConnectSheetsServiceIfNecessary()
	if err != nil {
		fmt.Printf("Error connecting to Google Sheets: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       "Internal server error",
		}, nil
	}

	employeeId, err := GetEmployeeId.HandleRequest(signReq.Email)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error getting employeeId: %v", err.Error()),
		}, nil
	}

	fmt.Println("Employee ID:", employeeId)
	clientId := os.Getenv("COGNITO_CLIENT_ID")
	if clientId == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       "COGNITO_CLIENT_ID not set",
		}, nil
	}

	sess := session.Must(session.NewSession())
	client := cognitoidentityprovider.New(sess)
	signUpInput := (&cognitoidentityprovider.SignUpInput{
		ClientId: aws.String(clientId),
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
	}, nil

}
