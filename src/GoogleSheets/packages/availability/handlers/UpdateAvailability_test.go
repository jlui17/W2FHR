package Availability

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"testing"
)

type mockSheetNoUpdate struct{}

func (m *mockSheetNoUpdate) Get() (*AllAvailability, error) {
	return &AllAvailability{CanUpdate: false}, nil
}
func (m *mockSheetNoUpdate) Update(row int, new *EmployeeAvailability) error {
	return nil
}

func TestUpdate(t *testing.T) {
	s := &mockSheet{}
	noUpdateSheet := &mockSheetNoUpdate{}
	type Input struct {
		id    string
		new   *EmployeeAvailability
		sheet availabilitySheet
	}

	tests := []struct {
		name     string
		input    Input
		expected error
	}{
		{
			name: "prevents update",
			input: Input{
				sheet: noUpdateSheet,
			},
			expected: ErrNoUpdating,
		},
		{
			name: "employee not found",
			input: Input{
				id:    "3",
				sheet: s,
			},
			expected: SharedConstants.ErrEmployeeNotFound,
		},
		{
			name: "success",
			input: Input{
				id:    "1",
				sheet: s,
			},
			expected: nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := doUpdate(test.input.id, test.input.new, test.input.sheet)
			if err != test.expected {
				t.Errorf("expected and actual errors differ.\nactual: %s\nexpected: %s", err, test.expected)
			}
		})
	}
}
