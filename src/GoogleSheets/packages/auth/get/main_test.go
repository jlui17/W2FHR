package GetEmployeeId

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"testing"
)

func TestGetEmployeeIdIsNotCaseSensitive(t *testing.T) {
	email := "email"
	staffListInfo := AuthConstants.STAFF_LIST_INFO{
		Emails:      []interface{}{"EMAIL"},
		EmployeeIds: []interface{}{"1"},
	}

	expectedEmployeeId := "1"

	actualEmployeeId, err := getEmployeeId(email, staffListInfo)
	if err != nil {
		t.Errorf("email in staff list info, shouldn't fail")
	}

	if actualEmployeeId != expectedEmployeeId {
		t.Errorf("didn't find the employeeId, should have")
	}
}

func TestGetEmployeeIdTrimsEmails(t *testing.T) {
	email := "email"
	staffListInfo := AuthConstants.STAFF_LIST_INFO{
		Emails:      []interface{}{"  EMAIL  "},
		EmployeeIds: []interface{}{"1"},
	}

	expectedEmployeeId := "1"

	actualEmployeeId, err := getEmployeeId(email, staffListInfo)
	if err != nil {
		t.Errorf("email in staff list info, shouldn't fail")
	}

	if actualEmployeeId != expectedEmployeeId {
		t.Errorf("should have trimmed email in staff lsit and found it")
	}
}
