package Availability

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"io"
	"log"
	"reflect"
	"testing"
)

type mockSheet struct{}

func (m *mockSheet) Get() (*AllAvailability, error) {
	return &AllAvailability{
		EmployeeIds: [][]interface{}{
			{"1"},
			{"2"},
		},
		Availabilities: [][]interface{}{
			{"FALSE", "FALSE", "FALSE", "FALSE"},
			{"TRUE", "TRUE", "FALSE", "FALSE"},
		},
		Dates:     []interface{}{"d1", "d2", "d3", "d4"},
		CanUpdate: true,
	}, nil
}

func (m *mockSheet) Update(row int, new *EmployeeAvailability) error {
	return nil
}

func TestGet(t *testing.T) {
	log.SetOutput(io.Discard)
	s := &mockSheet{}
	type Input struct {
		id    string
		sheet availabilitySheet
	}

	tests := []struct {
		name        string
		input       Input
		expected    EmployeeAvailability
		shouldErr   bool
		expectedErr error
	}{
		{
			name: "should find employee 1",
			input: Input{
				id:    "1",
				sheet: s,
			},
			expected: EmployeeAvailability{
				Day1: EmployeeAvailabilityDay{
					IsAvailable: false,
					Date:        "d1",
				},
				Day2: EmployeeAvailabilityDay{
					IsAvailable: false,
					Date:        "d2",
				},
				Day3: EmployeeAvailabilityDay{
					IsAvailable: false,
					Date:        "d3",
				},
				Day4: EmployeeAvailabilityDay{
					IsAvailable: false,
					Date:        "d4",
				},
				CanUpdate: true,
			},
		},
		{
			name: "should find employee 2",
			input: Input{
				id:    "2",
				sheet: s,
			},
			expected: EmployeeAvailability{
				Day1: EmployeeAvailabilityDay{
					IsAvailable: true,
					Date:        "d1",
				},
				Day2: EmployeeAvailabilityDay{
					IsAvailable: true,
					Date:        "d2",
				},
				Day3: EmployeeAvailabilityDay{
					IsAvailable: false,
					Date:        "d3",
				},
				Day4: EmployeeAvailabilityDay{
					IsAvailable: false,
					Date:        "d4",
				},
				CanUpdate: true,
			},
		},
		{
			name: "error finding employee 3",
			input: Input{
				id:    "3",
				sheet: s,
			},
			shouldErr:   true,
			expectedErr: SharedConstants.ErrEmployeeNotFound,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if !test.shouldErr {
				res, err := doGet(test.input.id, test.input.sheet)
				if err != nil {
					t.Errorf("failed to find employee %s availability", test.input.id)
				}

				if !reflect.DeepEqual(*res, test.expected) {
					t.Errorf("expected and actual availabilities differ.\nactual: %v\nexpected: %v", res, test.expected)
				}
			} else {
				_, err := doGet(test.input.id, test.input.sheet)
				if err != test.expectedErr {
					t.Errorf("expected and actual errors differ.\nactual: %s\nexpected: %s", err, test.expectedErr)
				}
			}
		})
	}
}
