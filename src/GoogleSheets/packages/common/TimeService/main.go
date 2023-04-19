package TimeService

import (
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"time"
)

func GetToday() time.Time {
	y, m, d := time.Now().Date()
	today := time.Date(y, m, d, 0, 0, 0, 0, time.Local)
	return today
}

func ConvertDateToTime(date string) *time.Time {
	t, _ := time.ParseInLocation(TimesheetConstants.DATE_FORMAT, date, time.Local)
	return &t
}
