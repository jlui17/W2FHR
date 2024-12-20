package TimeUtil

import (
	"log"
	"time"
)

const (
	vancouverTimeZone  string = "America/Los_Angeles"
	ScheduleDateFormat string = "Monday, January 2, 2006"
	ApiDateFormat      string = time.DateOnly
)

func ConvertDateToTime(date string, dateFormat string) time.Time {
	vancouverTime, err := time.LoadLocation(vancouverTimeZone)
	if err != nil {
		log.Printf("[ERROR] Couldn't load location for time zone: %s", err.Error())
		panic(err)
	}

	t, _ := time.ParseInLocation(dateFormat, date, vancouverTime)
	return t
}
