package Availability

import (
	"reflect"
	"testing"
)

func TestTransformDatesIfNecessaryAddsDay4(t *testing.T) {
	dates := []interface{}{"d1", "d2", "d3"}
	transformDatesIfNecessary(&dates)

	expectedDates := []interface{}{"d1", "d2", "d3", ""}
	if !reflect.DeepEqual(dates, expectedDates) {
		t.Errorf("Expected %v, but got %v", expectedDates, dates)
	}
}

func TestTransformDatesIfNecessaryDoesntAddDay4IfPresent(t *testing.T) {
	dates := []interface{}{"d1", "d2", "d3", "d4"}
	transformDatesIfNecessary(&dates)

	expectedDates := []interface{}{"d1", "d2", "d3", "d4"}
	if !reflect.DeepEqual(dates, expectedDates) {
		t.Errorf("Expected %v, but got %v", expectedDates, dates)
	}
}

func TestCreateAvailability(t *testing.T) {
	daysAvailable := []interface{}{"TRUE", "FALSE", "TRUE", "FALSE"}
	dates := []interface{}{"d1", "d2", "d3"}

	expected := &EmployeeAvailability{
		Day1: EmployeeAvailabilityDay{
			IsAvailable: true,
			Date:        dates[0].(string),
		},
		Day2: EmployeeAvailabilityDay{
			IsAvailable: false,
			Date:        dates[1].(string),
		},
		Day3: EmployeeAvailabilityDay{
			IsAvailable: true,
			Date:        dates[2].(string),
		},
		Day4: EmployeeAvailabilityDay{
			IsAvailable: false,
			Date:        "",
		},
		CanUpdate: false,
	}

	if ans := createAvailability(daysAvailable, dates, "TRUE"); !reflect.DeepEqual(ans, expected) {
		t.Errorf("Expected %v, but got %v", expected, ans)
	}

	expected.CanUpdate = true
	if ans := createAvailability(daysAvailable, dates, "FALSE"); !reflect.DeepEqual(ans, expected) {
		t.Errorf("Expected %v, but got %v", expected, ans)
	}
}
