package Availability

import (
	"reflect"
	"testing"
)

func TestCreateAvailability(t *testing.T) {
	daysAvailable := []interface{}{"TRUE", "FALSE", "TRUE", "FALSE"}
	dates := []interface{}{"d1", "d2", "d3", "d4"}

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
			Date:        dates[3].(string),
		},
		CanUpdate:  false,
		ShowMonday: false,
	}

	if ans := createAvailability(daysAvailable, dates, "TRUE", false); !reflect.DeepEqual(ans, expected) {
		t.Errorf("Expected %v, but got %v", expected, ans)
	}

	expected.CanUpdate = true
	expected.ShowMonday = true
	if ans := createAvailability(daysAvailable, dates, "FALSE", true); !reflect.DeepEqual(ans, expected) {
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
	positions := []string{
		"Attendant",
		"Supervisor",
		"Manager",
		"Attendant",
		"Supervisor",
	}

	expected := &[]AvailabileEmployees{
		{ // Day 1
			{Name: "John Doe", Position: "Attendant"},
			{Name: "Bob Wilson", Position: "Manager"},
			{Name: "Mike Johnson", Position: "Supervisor"},
		},
		{ // Day 2
			{Name: "Jane Smith", Position: "Supervisor"},
			{Name: "Bob Wilson", Position: "Manager"},
		},
		{ // Day 3
			{Name: "John Doe", Position: "Attendant"},
			{Name: "Jane Smith", Position: "Supervisor"},
			{Name: "Alice Brown", Position: "Attendant"},
		},
		{ // Day 4
			{Name: "John Doe", Position: "Attendant"},
			{Name: "Bob Wilson", Position: "Manager"},
			{Name: "Mike Johnson", Position: "Supervisor"},
		},
	}

	actual := getEmployeesAvailablePerDay(input, positions)

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("Expected %v, but got %v", expected, actual)
	}
}

func TestCreateAvailabilityForTheWeek(t *testing.T) {
	dates := []string{"d1", "d2", "d3", "d4"}
	employeesAvailablePerDay := &[]AvailabileEmployees{
		{ // Day 1
			{Name: "Bob Wilson", Position: "Manager"},
			{Name: "John Doe", Position: "Attendant"},
			{Name: "Mike Johnson", Position: "Supervisor"},
		},
		{ // Day 2
			{Name: "Bob Wilson", Position: "Manager"},
			{Name: "Jane Smith", Position: "Supervisor"},
		},
		{ // Day 3
			{Name: "Alice Brown", Position: "Attendant"},
			{Name: "Jane Smith", Position: "Supervisor"},
			{Name: "John Doe", Position: "Attendant"},
		},
		{ // Day 4
			{Name: "Bob Wilson", Position: "Manager"},
			{Name: "John Doe", Position: "Attendant"},
			{Name: "Mike Johnson", Position: "Supervisor"},
		},
	}
	expected := AvailabilityForTheWeek{
		"d1": (*employeesAvailablePerDay)[0],
		"d2": (*employeesAvailablePerDay)[1],
		"d3": (*employeesAvailablePerDay)[2],
		"d4": (*employeesAvailablePerDay)[3],
	}

	actual := createAvailabilityForTheWeek(dates, employeesAvailablePerDay)
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("Expected %v, but got %v", expected, actual)
	}
}
