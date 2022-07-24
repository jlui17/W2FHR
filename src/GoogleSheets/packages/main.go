package main

import (
	"context"
	"fmt"

	"GoogleSheets/packages/common/secrets"

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
	apiKey, err := secrets.GetGoogleSheetsApiKey()
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       fmt.Sprintf("Hello %s! %s", name, apiKey),
	}
}

func main() {
	lambda.Start(HandleRequest)
}
