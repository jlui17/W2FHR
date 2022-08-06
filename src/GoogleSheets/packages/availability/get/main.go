package GetAvailability

import (
	googleClient "GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/Types/AvailabilityConstants"
	"context"
	"errors"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

func Get(employeeId string) (AvailabilityConstants.EMPLOYEE_AVAILABILITY, error) {
	client := googleClient.GetReadOnlyClient()

	sheetsService, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_SHEET_GET_RANGE

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	for i := 0; i < len(response.Values); i++ {
		if response.Values[i][0] == employeeId {
			isAvailabileDay1 := response.Values[i][6] == "TRUE"
			isAvailabileDay2 := response.Values[i][7] == "TRUE"
			isAvailabileDay3 := response.Values[i][8] == "TRUE"
			isAvailabileDay4 := response.Values[i][9] == "TRUE"

			return AvailabilityConstants.EMPLOYEE_AVAILABILITY{
				Day1: isAvailabileDay1,
				Day2: isAvailabileDay2,
				Day3: isAvailabileDay3,
				Day4: isAvailabileDay4,
			}, nil
		}
	}

	return AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, errors.New(AvailabilityConstants.EMPLOYEE_AVAILABILITY_NOT_FOUND)
}
