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

func TestGetEmployeesAvailablePerDay(t *testing.T) {
	input := [][]string{
		{"John Doe", "TRUE", "FALSE", "TRUE", "TRUE"},
		{"Jane Smith", "FALSE", "TRUE", "TRUE", "FALSE"},
		{"Bob Wilson", "TRUE", "TRUE", "FALSE", "TRUE"},
		{"Alice Brown", "FALSE", "FALSE", "TRUE", "FALSE"},
		{"Mike Johnson", "TRUE", "FALSE", "FALSE", "TRUE"},
	}
	expected := [][]string{
		{"John Doe", "Bob Wilson", "Mike Johnson"},
		{"Jane Smith", "Bob Wilson"},
		{"John Doe", "Jane Smith", "Alice Brown"},
		{"John Doe", "Bob Wilson", "Mike Johnson"},
	}

	actual := getEmployeesAvailablePerDay(input)
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("Expected %v, but got %v", expected, actual)
	}
}

func TestCreateAvailabilityForTheWeek(t *testing.T) {
	dates := []string{"d1", "d2", "d3", "d4"}
	employeesAvailablePerDay := [][]string{
		{"John Doe", "Bob Wilson", "Mike Johnson"},
		{"Jane Smith", "Bob Wilson"},
		{"John Doe", "Jane Smith", "Alice Brown"},
		{"John Doe", "Bob Wilson", "Mike Johnson"},
	}
	expected := AvailabilityForTheWeek{
		"d1": employeesAvailablePerDay[0],
		"d2": employeesAvailablePerDay[1],
		"d3": employeesAvailablePerDay[2],
		"d4": employeesAvailablePerDay[3],
	}

	actual := createAvailabilityForTheWeek(dates, employeesAvailablePerDay)
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("Expected %v, but got %v", expected, actual)
	}
}
