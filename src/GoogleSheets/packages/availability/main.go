package main

import (
	GetAvailability "GoogleSheets/packages/availability/get"
	UpdateAvailability "GoogleSheets/packages/availability/update"
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Utilities/EmployeeInfo"
	"context"
	"encoding/json"
	"log"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	idToken, exists := event.Headers["Authorization"]
	if !exists {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       SharedConstants.INCLUDE_AUTH_HEADER_ERROR,
		}, nil
	}

	GoogleClient.ConnectSheetsServiceIfNecessary()
	employeeInfo, err := EmployeeInfo.New(idToken)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Body:       err.Error(),
		}, nil
	}

	log.Printf("[INFO] %s Availability Request for email: %s, employee id: %s",
		strings.ToUpper(event.HTTPMethod),
		employeeInfo.GetEmployeeId(),
		employeeInfo.GetEmail(),
	)

	switch event.HTTPMethod {
	case "GET":
		return GetAvailability.HandleRequest(employeeInfo.GetEmployeeId())
	case "POST":
		newAvailabilityFromRequestBody := event.Body
		newEmployeeAvailability := AvailabilityConstants.EmployeeAvailability{}
		log.Printf("New Availability: %s", newAvailabilityFromRequestBody)
		json.Unmarshal([]byte(newAvailabilityFromRequestBody), &newEmployeeAvailability)
		log.Printf("Successfully parsed request body: %v", newEmployeeAvailability)

		return UpdateAvailability.HandleRequest(employeeInfo.GetEmployeeId(), &newEmployeeAvailability)
	default:
		return events.APIGatewayProxyResponse{
			StatusCode: 501,
		}, nil
	}
}

func main() {
	lambda.Start(HandleRequest)
}
