package main

import (
	googleClient "GoogleSheets/packages/common/GoogleClient"
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	client, err := googleClient.GetClient()
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}, nil
	}
	if client != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 201,
			Body:       "Success",
		}, nil
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 400,
		Body:       "Bad",
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
