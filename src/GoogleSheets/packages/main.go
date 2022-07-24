package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) events.APIGatewayProxyResponse {
	name, nameExists := event.QueryStringParameters["name"]
	if !nameExists {
		return events.APIGatewayProxyResponse{
			StatusCode: 404,
			Body:       "No name",
		}
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       fmt.Sprintf("Hello %s! %s", name, os.Getenv("GOOGLE_API_KEY")),
	}
}

func main() {
	lambda.Start(HandleRequest)
}
