package TimeUtil

import (
	"testing"
	"time"
)

func TestConvertDateToTime(t *testing.T) {
	initVancouverTime()

	tests := []struct {
		name   string
		date   string
		format string
		want   time.Time
	}{
		{
			name:   "schedule date format",
			date:   "Wednesday, April 2, 2025",
			format: ScheduleDateFormat,
			want:   time.Date(2025, 4, 2, 0, 0, 0, 0, vancouverTime),
		},
		{
			name:   "API date format",
			date:   "2022-11-28",
			format: ApiDateFormat,
			want:   time.Date(2022, 11, 28, 0, 0, 0, 0, vancouverTime),
		},
		{
			name:   "schedule date format different month",
			date:   "Monday, December 25, 2023",
			format: ScheduleDateFormat,
			want:   time.Date(2023, 12, 25, 0, 0, 0, 0, vancouverTime),
		},
		{
			name:   "API date new year",
			date:   "2024-01-01",
			format: ApiDateFormat,
			want:   time.Date(2024, 1, 1, 0, 0, 0, 0, vancouverTime),
		},
		{
			name:   "API date leap year",
			date:   "2024-02-29",
			format: ApiDateFormat,
			want:   time.Date(2024, 2, 29, 0, 0, 0, 0, vancouverTime),
		},
		{
			name:   "empty string returns zero time",
			date:   "",
			format: ApiDateFormat,
			want:   time.Time{},
		},
		{
			name:   "invalid date returns zero time",
			date:   "not-a-date",
			format: ApiDateFormat,
			want:   time.Time{},
		},
		{
			name:   "wrong format for API date returns zero time",
			date:   "Wednesday, April 2, 2025",
			format: ApiDateFormat,
			want:   time.Time{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ConvertDateToTime(tt.date, tt.format)
			if !got.Equal(tt.want) {
				t.Errorf("ConvertDateToTime(%q, %q) = %v, want %v", tt.date, tt.format, got, tt.want)
			}
		})
	}
}
