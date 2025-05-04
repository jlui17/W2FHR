package Availability

import (
	"reflect"
	"sort"
	"testing"
)

func TestAvailabileEmployeesSortByPosition(t *testing.T) {
	// Test that employees are sorted correctly by position
	// Order should be: Attendant < Supervisor < Manager
	employees := AvailabileEmployees{
		{Name: "Alice", Position: "Manager"},
		{Name: "Bob", Position: "Attendant"},
		{Name: "Charlie", Position: "Supervisor"},
	}

	expected := AvailabileEmployees{
		{Name: "Bob", Position: "Attendant"},
		{Name: "Charlie", Position: "Supervisor"},
		{Name: "Alice", Position: "Manager"},
	}

	// Sort the slice
	sort.Sort(employees)

	if !reflect.DeepEqual(employees, expected) {
		t.Errorf("Employees were not sorted correctly by position.\nExpected: %v\nGot: %v", expected, employees)
	}
}

func TestAvailabileEmployeesSortByNameWhenPositionEqual(t *testing.T) {
	// Test that employees with the same position are sorted alphabetically by name
	employees := AvailabileEmployees{
		{Name: "Charlie", Position: "Attendant"},
		{Name: "Alice", Position: "Attendant"},
		{Name: "Eve", Position: "Supervisor"},
		{Name: "David", Position: "Supervisor"},
		{Name: "Bob", Position: "Attendant"},
	}

	expected := AvailabileEmployees{
		{Name: "Alice", Position: "Attendant"},
		{Name: "Bob", Position: "Attendant"},
		{Name: "Charlie", Position: "Attendant"},
		{Name: "David", Position: "Supervisor"},
		{Name: "Eve", Position: "Supervisor"},
	}

	// Sort the slice
	sort.Sort(employees)

	if !reflect.DeepEqual(employees, expected) {
		t.Errorf("Employees with the same position were not sorted alphabetically by name.\nExpected: %v\nGot: %v", expected, employees)
	}
}

func TestAvailabileEmployeesSortByPositionKeywords(t *testing.T) {
	// Test that employees are sorted correctly by position keywords
	employees := AvailabileEmployees{
		{Name: "Alice", Position: "Assistant Manager"},
		{Name: "Bob", Position: "Floor Attendant"},
		{Name: "Charlie", Position: "Team Lead"},
		{Name: "David", Position: "Senior Supervisor"},
		{Name: "Eve", Position: "Shift Manager"},
		{Name: "Frank", Position: "Junior Staff"},
	}

	expected := AvailabileEmployees{
		{Name: "Bob", Position: "Floor Attendant"},
		{Name: "Charlie", Position: "Team Lead"},
		{Name: "Frank", Position: "Junior Staff"},
		{Name: "David", Position: "Senior Supervisor"},
		{Name: "Alice", Position: "Assistant Manager"},
		{Name: "Eve", Position: "Shift Manager"},
	}

	// Sort the slice
	sort.Sort(employees)

	if !reflect.DeepEqual(employees, expected) {
		t.Errorf("Employees were not sorted correctly by position keywords.\nExpected: %v\nGot: %v", expected, employees)
	}
}

func TestGetPositionPriority(t *testing.T) {
	tests := []struct {
		name     string
		position string
		want     int
	}{
		{"Exact Manager", "Manager", 3},
		{"Contains Manager", "Assistant Manager", 3},
		{"Case Insensitive Manager", "STORE manager", 3},
		{"Exact Supervisor", "Supervisor", 2},
		{"Contains Supervisor", "Senior Supervisor", 2},
		{"Case Insensitive Supervisor", "shift SUPERVISOR", 2},
		{"Contains Lead", "Team Lead", 1},
		{"Case Insensitive Lead", "LEAD Attendant", 1},
		{"Exact Attendant", "Attendant", 1},
		{"Contains Attendant", "Floor Attendant", 1},
		{"Default Priority", "Staff", 1},
		{"Empty String", "", 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getPositionPriority(tt.position); got != tt.want {
				t.Errorf("getPositionPriority(%q) = %v, want %v", tt.position, got, tt.want)
			}
		})
	}
}
