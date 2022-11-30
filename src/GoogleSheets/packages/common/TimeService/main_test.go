package TimeService

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"testing"

	"google.golang.org/api/sheets/v4"
)

func TestFormatDatesOutputsCorrectLengthArray(t *testing.T) {
	testDates := []interface{}{"1", "2", "3", "4"}
	testValues := [][]interface{}{testDates}

	unformattedDates := sheets.ValueRange{Values: testValues}
	formattedDates := *formatDates(&unformattedDates)

	if len(formattedDates) != SharedConstants.NUM_OF_DATES {
		t.Errorf("formatDate doesn't output correct length array. Actual length: %d, Expected length: %d", len(formattedDates), SharedConstants.NUM_OF_DATES)
	}
}

func TestFormatDatesWith3Days(t *testing.T) {
	testDates := []interface{}{"1", "2", "3"}
	testValues := [][]interface{}{testDates}
	expectedDates := []string{"1", "2", "3", ""}

	unformattedDates := sheets.ValueRange{Values: testValues}
	formattedDates := *formatDates(&unformattedDates)

	if len(formattedDates) != SharedConstants.NUM_OF_DATES {
		t.Errorf("formatDate doesn't output correct length array. Actual length: %d, Expected length: %d", len(formattedDates), SharedConstants.NUM_OF_DATES)
	}

	for i := 0; i < len(formattedDates); i++ {
		if formattedDates[i] != expectedDates[i] {
			t.Errorf("formatDate doesn't format dates correctly. Actual: %v, Expected: %v", formattedDates, expectedDates)
		}
	}
}

func TestFormatDatesWith4Days(t *testing.T) {
	testDates := []interface{}{"1", "2", "3", "4"}
	testValues := [][]interface{}{testDates}
	expectedDates := []string{"1", "2", "3", "4"}

	unformattedDates := sheets.ValueRange{Values: testValues}
	formattedDates := *formatDates(&unformattedDates)

	for i := 0; i < len(formattedDates); i++ {
		if formattedDates[i] != expectedDates[i] {
			t.Errorf("formatDate doesn't format dates correctly. Actual: %v, Expected: %v", formattedDates, expectedDates)
		}
	}
}
