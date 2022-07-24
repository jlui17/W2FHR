package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	name, nameExists := event.QueryStringParameters["name"]
	if !nameExists {
		return events.APIGatewayProxyResponse{
			StatusCode: 404,
			Body:       "No name",
		}, nil
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       fmt.Sprintf("Hello %s!", name),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
