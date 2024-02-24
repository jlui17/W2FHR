package GetAvailability

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
)

func HandleRequest(employeeId string) (events.APIGatewayProxyResponse, error) {
	employeeAvailability, err := getEmployeeAvailability(employeeId)

	if err != nil {
		log.Printf("[ERROR] Failed to get availability for %s: %s", employeeId, err.Error())
		statusCode := 500
		if err.Error() == SharedConstants.EMPLOYEE_NOT_FOUND_ERROR {
			statusCode = 404
		}

		return events.APIGatewayProxyResponse{
			StatusCode: statusCode,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}

	res, _ := json.Marshal(employeeAvailability)
	log.Printf("[INFO] Found availability for %s: %s", employeeId, fmt.Sprint(string(res)))
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, nil
}

func getEmployeeAvailability(employeeId string) (*AvailabilityConstants.EmployeeAvailability, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		return &AvailabilityConstants.EmployeeAvailability{}, err
	}

	res, err := sheetsService.GetAvailability()
	if err != nil {
		return &AvailabilityConstants.EmployeeAvailability{}, err
	}

	employeeIds := res.EmployeeIds
	availabilities := res.Availabilities
	dates := res.Dates
	canUpdate := res.CanUpdate

	r := -1
	for i, row := range employeeIds {
		if row == employeeId {
			r = i
			break
		}
	}
	if r == -1 {
		return &AvailabilityConstants.EmployeeAvailability{}, errors.New(SharedConstants.EMPLOYEE_NOT_FOUND_ERROR)
	}

	day1 := availabilities[r][0] == "TRUE"
	day2 := availabilities[r][1] == "TRUE"
	day3 := availabilities[r][2] == "TRUE"
	day4 := availabilities[r][3] == "TRUE"

	return &AvailabilityConstants.EmployeeAvailability{
		Day1:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: day1, Date: dates[0].(string)},
		Day2:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: day2, Date: dates[1].(string)},
		Day3:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: day3, Date: dates[2].(string)},
		Day4:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: day4, Date: dates[3].(string)},
		CanUpdate: canUpdate,
	}, nil
}

func FindRowOfEmployeeAvailability(availabilityTimesheet [][]interface{}, employeeId string) (int, error) {
	for i := 0; i < len(availabilityTimesheet); i++ {
		if availabilityTimesheet[i][0] == employeeId {
			return i, nil
		}
	}
	return 0, errors.New(SharedConstants.EMPLOYEE_NOT_FOUND_ERROR)
}
