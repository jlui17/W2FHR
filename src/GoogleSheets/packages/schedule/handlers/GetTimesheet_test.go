package Schedule

import (
	"testing"
)

func TestGetStartAndEndDates(t *testing.T) {
	tests := []struct {
		name    string
		start   string
		end     string
		wantErr bool
	}{
		{
			name:    "end before start returns error",
			start:   "2024-10-10",
			end:     "2024-10-9",
			wantErr: true,
		},
		{
			name:    "end after start succeeds",
			start:   "2024-10-10",
			end:     "2024-10-11",
			wantErr: false,
		},
		{
			name:    "same date succeeds",
			start:   "2024-10-10",
			end:     "2024-10-10",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, _, err := getStartAndEndDates(tt.start, tt.end)
			if tt.wantErr && err == nil {
				t.Errorf("getStartAndEndDates(%q, %q): expected error, got nil", tt.start, tt.end)
			}
			if !tt.wantErr && err != nil {
				t.Errorf("getStartAndEndDates(%q, %q): unexpected error: %v", tt.start, tt.end, err)
			}
		})
	}
}
