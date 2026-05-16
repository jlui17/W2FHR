package Scheduling

import (
	Schedule "GoogleSheets/packages/schedule/handlers"
	"reflect"
	"testing"
	"time"
)

func TestConvertNewScheduleRequestToInternal(t *testing.T) {
	// ConvertDateToTime uses America/Los_Angeles (Vancouver) timezone
	vancouver, _ := time.LoadLocation("America/Los_Angeles")

	tests := []struct {
		name           string
		req            NewScheduleRequest
		currentTimeStr string
		want           []Schedule.InternalShift
	}{
		{
			name:           "empty shifts",
			req:            NewScheduleRequest{Shifts: []NewScheduleShift{}},
			currentTimeStr: "2025-05-04 12:00",
			want:           []Schedule.InternalShift{},
		},
		{
			name: "single shift with all fields",
			req: NewScheduleRequest{
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "Morning Shift",
						Employee:      "John Smith (123)",
						Date:          "2025-05-04",
						StartTime:     "09:00",
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						Designation:   "Games",
					},
				},
			},
			currentTimeStr: "2025-05-04 12:00",
			want: []Schedule.InternalShift{
				{
					ShiftTitle:    "Morning Shift",
					Employee:      "John Smith (123)",
					Date:          time.Date(2025, 5, 4, 0, 0, 0, 0, vancouver),
					StartTime:     "09:00",
					EndTime:       "17:00",
					BreakDuration: "00:30:00",
					LastUpdated:   "2025-05-04 12:00",
					Designation:   "Games",
				},
			},
		},
		{
			name: "multiple shifts preserve order and fields",
			req: NewScheduleRequest{
				Shifts: []NewScheduleShift{
					{
						ShiftTitle:    "First Shift",
						Employee:      "Alice (1)",
						Date:          "2025-05-04",
						StartTime:     "08:00",
						EndTime:       "12:00",
						BreakDuration: "00:15:00",
						Designation:   "Games",
					},
					{
						ShiftTitle:    "Second Shift",
						Employee:      "Bob (2)",
						Date:          "2025-05-05",
						StartTime:     "13:00",
						EndTime:       "17:00",
						BreakDuration: "00:30:00",
						Designation:   "Water Walkers",
					},
				},
			},
			currentTimeStr: "now",
			want: []Schedule.InternalShift{
				{
					ShiftTitle:    "First Shift",
					Employee:      "Alice (1)",
					Date:          time.Date(2025, 5, 4, 0, 0, 0, 0, vancouver),
					StartTime:     "08:00",
					EndTime:       "12:00",
					BreakDuration: "00:15:00",
					LastUpdated:   "now",
					Designation:   "Games",
				},
				{
					ShiftTitle:    "Second Shift",
					Employee:      "Bob (2)",
					Date:          time.Date(2025, 5, 5, 0, 0, 0, 0, vancouver),
					StartTime:     "13:00",
					EndTime:       "17:00",
					BreakDuration: "00:30:00",
					LastUpdated:   "now",
					Designation:   "Water Walkers",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := convertNewScheduleRequestToInternal(tt.req, tt.currentTimeStr)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("convertNewScheduleRequestToInternal() = %v, want %v", got, tt.want)
			}
		})
	}
}
