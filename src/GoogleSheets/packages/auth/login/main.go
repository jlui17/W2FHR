package LoginEmployee

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"

	"context"
	"encoding/json"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var loginReq AuthConstants.LoginRequest
	err := json.Unmarshal([]byte(event.Body), &loginReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
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

		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       err.Error(),
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, nil
	}
	authResultJSON, err := json.Marshal(authResp.AuthenticationResult)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       "Error marshalling response",
		}, nil
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(authResultJSON),
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
	}, nil
}
