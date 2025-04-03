package TimeUtil

import (
	"fmt"
	"testing"
	"time"
)

func TestConvertScheduleTime(t *testing.T) {
	initVancouverTime()

	scheduleTime := "Wednesday, April 2, 2025"
	expectedTime := time.Date(2025, 4, 2, 0, 0, 0, 0, vancouverTime)

	convertedTime := ConvertDateToTime(scheduleTime, ScheduleDateFormat)
	fmt.Println(expectedTime, convertedTime)

	if !expectedTime.Equal(convertedTime) {
		t.Fail()
	}
}

func TestConvertApiTime(t *testing.T) {
	initVancouverTime()

	scheduleTime := "2022-11-28"
	expectedTime := time.Date(2022, 11, 28, 0, 0, 0, 0, vancouverTime)

	convertedTime := ConvertDateToTime(scheduleTime, ApiDateFormat)

	if !expectedTime.Equal(convertedTime) {
		t.Fail()
	}
}
