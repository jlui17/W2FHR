package main

import (
	googleClient "GoogleSheets/packages/common/GoogleClient"
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	client := googleClient.GetReadOnlyClient()

	sheetsService, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error creating sheets service: %s", err.Error()),
		}, nil
	}

	sheetId := "1Q9Wt-dtjJN3c3lcJ1v8SHTTz4molRm09rAru3BT8AV8"
	readRange := "Master Timesheet!A2"

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Error reading sheet: %s", err.Error()),
		}, nil
	}

	employeeId, exists := event.PathParameters["employeeId"]
	if !exists {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       "Employee ID not found",
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       fmt.Sprintf("%s, Employee ID: %s", response.Values[0][0], employeeId),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
