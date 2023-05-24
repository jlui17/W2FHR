package TimeService

import (
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"log"
	"time"
)

const vancouverTimeZone string = "America/Los_Angeles"

func GetToday() time.Time {
	vancouverTime, err := time.LoadLocation(vancouverTimeZone)
	if err != nil {
		log.Printf("[ERROR] Couldn't load location for time zone: %s", err.Error())
		panic(err)
	}

	y, m, d := time.Now().In(vancouverTime).Date()
	today := time.Date(y, m, d, 0, 0, 0, 0, vancouverTime)
	return today
}

func ConvertDateToTime(date string) *time.Time {
	vancouverTime, err := time.LoadLocation(vancouverTimeZone)
	if err != nil {
		log.Printf("[ERROR] Couldn't load location for time zone: %s", err.Error())
		panic(err)
	}

	t, _ := time.ParseInLocation(TimesheetConstants.DATE_FORMAT, date, vancouverTime)
	return &t
}
