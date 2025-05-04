package Schedule

import (
	"reflect"
	"sort"
	"testing"
	"time"
)

func TestSortInternalShifts(t *testing.T) {
	now := time.Now()

	input := InternalShifts{
		{
			ShiftTitle:    "2. Evening Shift",
			Employee:      "John Smith",
			Date:          now,
			StartTime:     "14:00",
			EndTime:       "22:00",
			BreakDuration: "45min",
		},
		{
			ShiftTitle:    "1. Morning Shift",
			Employee:      "Alice Brown",
			Date:          now,
			StartTime:     "09:00",
			EndTime:       "17:00",
			BreakDuration: "30min",
		},
		{
			ShiftTitle:    "1. Morning Shift",
			Employee:      "Bob Wilson",
			Date:          now,
			StartTime:     "09:00",
			EndTime:       "17:00",
			BreakDuration: "30min",
		},
	}

	expected := InternalShifts{
		{
			ShiftTitle:    "1. Morning Shift",
			Employee:      "Alice Brown",
			Date:          now,
			StartTime:     "09:00",
			EndTime:       "17:00",
			BreakDuration: "30min",
		},
		{
			ShiftTitle:    "1. Morning Shift",
			Employee:      "Bob Wilson",
			Date:          now,
			StartTime:     "09:00",
			EndTime:       "17:00",
			BreakDuration: "30min",
		},
		{
			ShiftTitle:    "2. Evening Shift",
			Employee:      "John Smith",
			Date:          now,
			StartTime:     "14:00",
			EndTime:       "22:00",
			BreakDuration: "45min",
		},
	}

	sort.Sort(input)
	if !reflect.DeepEqual(input, expected) {
		t.Errorf("Expected: %v, got %v", expected, input)
	}
}
