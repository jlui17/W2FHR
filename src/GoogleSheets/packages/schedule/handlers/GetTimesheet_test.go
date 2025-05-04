package Schedule

import (
	"testing"
)

func TestGetStartAndEndDatesReturnsErrorIfStartIsBeforeEnd(t *testing.T) {
	start := "2024-10-10"
	end := "2024-10-9"
	_, _, err := getStartAndEndDates(start, end)
	if err == nil {
		t.Errorf("Expected error, got nil")
	}
}

func TestStartAndEndDatesReturnsSuccessfully(t *testing.T) {
	start := "2024-10-10"
	end := "2024-10-11"
	_, _, err := getStartAndEndDates(start, end)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}
