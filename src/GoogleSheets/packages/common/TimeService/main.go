package TimeService

import (
	"log"
	"time"
)

const (
	vancouverTimeZone = "America/Los_Angeles"
	dateFormat        = "Monday, January 2, 2006"
)

func GetToday() time.Time {
	vancouverTime, err := time.LoadLocation(vancouverTimeZone)
	if err != nil {
		log.Printf("[ERROR] Couldn't load location for time zone: %s", err.Error())
		panic(err)
	}

	y, m, d := time.Now().In(vancouverTime).Date()
	return time.Date(y, m, d, 0, 0, 0, 0, vancouverTime)
}

func ConvertDateToTime(date string) (time.Time, error) {
	vancouverTime, err := time.LoadLocation(vancouverTimeZone)
	if err != nil {
		log.Printf("[ERROR] Couldn't load location for time zone: %s", err.Error())
		panic(err)
	}

	return time.ParseInLocation(dateFormat, date, vancouverTime)
}
