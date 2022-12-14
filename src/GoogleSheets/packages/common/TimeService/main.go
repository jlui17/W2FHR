package TimeService

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"fmt"
	"time"

	"google.golang.org/api/sheets/v4"
)

func GetDatesForSettingAvailability(datesReadRange string) (*[]string, error) {
	sheetsService, err := GoogleClient.GetReadOnlyService()
	if err != nil {
		return nil, err
	}

	readRange := datesReadRange

	unformattedDates, err := sheetsService.Spreadsheets.Values.Get(AvailabilityConstants.AVAILABILITY_SHEET_ID, readRange).Do()
	if err != nil {
		return nil, err
	}

	dates := formatDates(unformattedDates)
	return dates, nil
}

func formatDates(unformattedDates *sheets.ValueRange) *[]string {
	dates := []string{}

	for i := 0; i < len(unformattedDates.Values[0]); i++ {
		dates = append(dates, fmt.Sprint(unformattedDates.Values[0][i]))
	}

	if len(dates) == 3 {
		dates = append(dates, "")
	}

	return &dates
}

func GetToday() time.Time {
	y, m, d := time.Now().Date()
	today := time.Date(y, m, d, 0, 0, 0, 0, time.Local)
	return today
}

func ConvertDateToTime(date string) *time.Time {
	t, _ := time.ParseInLocation(TimesheetConstants.DATE_FORMAT, date, time.Local)
	return &t
}
