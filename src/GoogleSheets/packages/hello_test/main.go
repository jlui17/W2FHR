package main

import (
	"GoogleSheets/packages/common/Constants/TestConstants"
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	var signReq TestConstants.SignUpRequest
	err := json.Unmarshal([]byte(event.Body), &signReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       "Invalid request body",
		}, nil
	}
	// sess := session.Must(session.NewSession())
	// svc := cognitoidentityprovider.New(sess)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       event.Body,
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
