package main

import (
	Availability "GoogleSheets/packages/availability/handlers"
	SharedConstants "GoogleSheets/packages/common/Constants"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
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
		log.Println("[ERROR] Availability - ID Token doesn't exist in header.")
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       SharedConstants.INCLUDE_AUTH_HEADER_ERROR,
		}, nil
	}

	employeeInfo, err := EmployeeInfo.New(idToken)
	if err != nil {
		log.Printf("[ERROR] Availability - failed to get employee info from ID token: %v, err: %s.", idToken, err)
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}

	log.Printf("[INFO] %s Availability Request for email: %s, employee id: %s",
		strings.ToUpper(event.HTTPMethod),
		employeeInfo.Email,
		employeeInfo.Id,
	)

	switch event.HTTPMethod {
	case "GET":
		availability, err := Availability.Get(employeeInfo.Id)
		if err != nil {
			log.Printf("[ERROR] Failed to get availability for %s: %s", employeeInfo.Id, err.Error())
			statusCode := 500
			if err == SharedConstants.ErrEmployeeNotFound {
				statusCode = 404
			}
			return events.APIGatewayProxyResponse{
				StatusCode: statusCode,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       err.Error(),
			}, nil
		}

		res, _ := json.Marshal(availability)
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       string(res),
		}, nil

	case "POST":
		newAvailabilityFromRequestBody := event.Body
		newEmployeeAvailability := Availability.EmployeeAvailability{}
		log.Printf("[INFO] Trying to update availability for %s: %s", employeeInfo.Id, newAvailabilityFromRequestBody)
		json.Unmarshal([]byte(newAvailabilityFromRequestBody), &newEmployeeAvailability)

		err := Availability.Update(employeeInfo.Id, &newEmployeeAvailability)
		if err != nil {
			log.Printf("[ERROR] Failed to update availability for %s: %s", employeeInfo.Id, err.Error())
			var statusCode int

			switch err.Error() {
			case Availability.UPDATE_AVAILABILITY_DISABLED_ERROR:
				statusCode = 403
			case SharedConstants.ErrEmployeeNotFound.Error():
				statusCode = 404
			default:
				statusCode = 500
			}

			return events.APIGatewayProxyResponse{
				StatusCode: statusCode,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
				Body:       err.Error(),
			}, nil
		}

		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       newAvailabilityFromRequestBody,
		}, nil

	default:
		return events.APIGatewayProxyResponse{
			StatusCode: 501,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, nil
	}
}

func main() {
	lambda.Start(HandleRequest)
}
