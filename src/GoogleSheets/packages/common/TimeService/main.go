package TimeService

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"fmt"
)

func GetDatesForSettingAvailability() (*[]string, error) {
	dates := []string{}

	sheetsService, err := GoogleClient.GetReadOnlyService()
	if err != nil {
		return &dates, err
	}

	readRange := "B5:E5"

	unformattedDates, err := sheetsService.Spreadsheets.Values.Get(AvailabilityConstants.AVAILABILITY_SHEET_ID, readRange).Do()
	if err != nil {
		return &dates, err
	}

	for i := 0; i < len(unformattedDates.Values[0]); i++ {
		dates = append(dates, fmt.Sprint(unformattedDates.Values[0][i]))
	}

	if len(dates) == 3 {
		dates = append(dates, "")
	}

	return &dates, nil
}