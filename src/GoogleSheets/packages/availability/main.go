package main

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	"GoogleSheets/packages/common/Types/AvailabilityConstants"
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	employeeId, exists := event.PathParameters["employeeId"]
	if !exists {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       "Please include employee id in request.",
		}, nil
	}

	employeeAvailability, err := GetAvailability.Get(employeeId)
	if err != nil {
		if err.Error() == AvailabilityConstants.EMPLOYEE_AVAILABILITY_NOT_FOUND {
			return events.APIGatewayProxyResponse{
				StatusCode: 404,
				Body:       fmt.Sprintf("Name not found for employee id %s", employeeId),
			}, nil
		}

		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}, nil
	}

	res, _ := json.Marshal(employeeAvailability)
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Body:       fmt.Sprint(string(res)),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
