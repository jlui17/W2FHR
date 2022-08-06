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

	sheetId := "1nomP3VKJxYewKICTwtPj464uZLclPEBgLv4i-6PPtSY"
	readRange := "Links!A2:J"

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

	for i := 0; i < len(response.Values); i++ {
		if response.Values[i][0] == employeeId {
			return events.APIGatewayProxyResponse{
				StatusCode: 201,
				Body:       fmt.Sprintf("Num of Employees: %s, Employee ID: %s, Friday: %s, Saturday: %s, Sunday: %s, Monday: %s", fmt.Sprint(len(response.Values)), employeeId, response.Values[i][6], response.Values[i][7], response.Values[i][8], response.Values[i][9]),
			}, nil
		}
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 404,
		Body:       fmt.Sprintf("Name not found for employee id %s", employeeId),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
