package Authorization

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"os"
	"reflect"
	"testing"
)

func TestGetEmployeeInfoForSignUp(t *testing.T) {
	attendantsGroupName := "attendants"
	os.Setenv("COGNITO_ATTENDANTS_GROUP_NAME", attendantsGroupName)

	type inputType struct {
		email                        string
		staffListInfo                *staffListInfo
		availabilitySheetEmployeeIds *[][]interface{}
	}

	tests := []struct {
		name        string
		input       inputType
		expected    *EmployeeInfoForSignUp
		expectedErr error
	}{
		{
			name: "Throws employee not found error when email doesn't exist in staff list",
			input: inputType{
				email: "some non existent email",
				staffListInfo: &staffListInfo{
					Emails:    []interface{}{"EMAIL"},
					Ids:       []interface{}{"1"},
					Positions: []interface{}{""},
				},
				availabilitySheetEmployeeIds: &[][]interface{}{},
			},
			expected:    &EmployeeInfoForSignUp{},
			expectedErr: SharedConstants.ErrEmployeeNotFound,
		},
		{
			name: "Throws employee not found error when id doesn't exist in availability sheet",
			input: inputType{
				email: "some non existent email",
				staffListInfo: &staffListInfo{
					Emails:    []interface{}{"EMAIL"},
					Ids:       []interface{}{"1"},
					Positions: []interface{}{""},
				},
				availabilitySheetEmployeeIds: &[][]interface{}{{"2"}},
			},
			expected:    &EmployeeInfoForSignUp{},
			expectedErr: SharedConstants.ErrEmployeeNotFound,
		},
		{
			name: "Ignores email case",
			input: inputType{
				email: "email",
				staffListInfo: &staffListInfo{
					Emails:    []interface{}{"EMAIL"},
					Ids:       []interface{}{"1"},
					Positions: []interface{}{""},
				},
				availabilitySheetEmployeeIds: &[][]interface{}{{"1"}},
			},
			expected: &EmployeeInfoForSignUp{
				Id:                   "1",
				Group:                attendantsGroupName,
				AvailabilitySheetRow: 0 + availabilitySheetRowOffset,
			},
			expectedErr: nil,
		},
		{
			name: "Ignores email whitespace",
			input: inputType{
				email: "email",
				staffListInfo: &staffListInfo{
					Emails:    []interface{}{"   email "},
					Ids:       []interface{}{"1"},
					Positions: []interface{}{""},
				},
				availabilitySheetEmployeeIds: &[][]interface{}{{"1"}},
			},
			expected: &EmployeeInfoForSignUp{
				Id:                   "1",
				Group:                attendantsGroupName,
				AvailabilitySheetRow: 0 + availabilitySheetRowOffset,
			},
			expectedErr: nil,
		},
		{
			name: "Finds correct availability sheet row",
			input: inputType{
				email: "email",
				staffListInfo: &staffListInfo{
					Emails:    []interface{}{"   email "},
					Ids:       []interface{}{"1"},
					Positions: []interface{}{""},
				},
				availabilitySheetEmployeeIds: &[][]interface{}{{"2"}, {"1"}},
			},
			expected: &EmployeeInfoForSignUp{
				Id:                   "1",
				Group:                attendantsGroupName,
				AvailabilitySheetRow: 1 + availabilitySheetRowOffset,
			},
			expectedErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ans, err := doGetInfo(tt.input.email, tt.input.staffListInfo, tt.input.availabilitySheetEmployeeIds)
			if tt.expectedErr != nil && err != tt.expectedErr {
				t.Errorf("Got %v, expected: %v", err, tt.expectedErr)
			}

			if !reflect.DeepEqual(ans, tt.expected) {
				t.Errorf("Got %v, expected %v", ans, tt.expected)
			}
		})
	}
}

func TestTranslateToCognitoGroups(t *testing.T) {
	attendantsGroupName := "attendants"
	supervisorsGroupName := "supervisors"
	managersGroupName := "managers"
	os.Setenv("COGNITO_ATTENDANTS_GROUP_NAME", attendantsGroupName)
	os.Setenv("COGNITO_SUPERVISORS_GROUP_NAME", supervisorsGroupName)
	os.Setenv("COGNITO_MANAGERS_GROUP_NAME", managersGroupName)

	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"Position without supervisor/manager translates to attendants group", "some position", attendantsGroupName},
		{"Position with supervisor translates to supervisors group", "1234sUperVisor987", supervisorsGroupName},
		{"Position with manager translates to managers group", "$$#21manAGERppl", managersGroupName},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ans := translateToCognitoGroup(tt.input)
			if ans != tt.expected {
				t.Errorf("Got %s, expected %s", ans, tt.expected)
			}
		})
	}
}
