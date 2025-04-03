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

var (
	vancouverTime *time.Location
)

func initVancouverTime() {
	localTime, err := time.LoadLocation(vancouverTimeZone)
	if err != nil {
		log.Printf("[ERROR] Couldn't load location for time zone: %s", err.Error())
		panic(err)
	}
	vancouverTime = localTime
}

func ConvertDateToTime(date string, format string) time.Time {
	if vancouverTime == nil {
		initVancouverTime()
	}

	t, _ := time.ParseInLocation(format, date, vancouverTime)
	return t
}
