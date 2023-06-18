package TimesheetProcessor

import (
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"reflect"
	"testing"
)

func createShift(employeeId string, title string, date string, start string, end string, breakDuration string) []interface{} {
	return []interface{}{
		"",
		"",
		employeeId,
		"",
		title,
		"",
		date,
		start,
		end,
		breakDuration,
	}
}

func TestCreateTimesheetProcessor(t *testing.T) {
	expectedTimesheet := TimesheetConstants.Timesheet{
		Shifts: []TimesheetConstants.EmployeeShift{},
	}
	timesheetProcessor := New("")

	if !reflect.DeepEqual(expectedTimesheet, timesheetProcessor.GetTimesheet()) {
		t.Errorf("Failed to create timesheet processor - didn't initialize with empty timesheet:\n Expected: %v \n Actual: %v", expectedTimesheet, timesheetProcessor.GetTimesheet())
	}
}

func TestProcessRowAddsShift(t *testing.T) {
	employeeId := "1"
	expectedShift := TimesheetConstants.EmployeeShift{
		Date:          "",
		ShiftTitle:    "",
		StartTime:     "",
		EndTime:       "",
		BreakDuration: "",
	}
	expectedTimesheet := TimesheetConstants.Timesheet{
		Shifts: []TimesheetConstants.EmployeeShift{expectedShift},
	}
	shift := createShift(employeeId, "", "", "", "", "")
	schedule := [][]interface{}{shift}

	timesheetProcessor := New(employeeId)
	timesheetProcessor.ProcessRow(schedule[0])
	actualTimesheet := timesheetProcessor.GetTimesheet()

	if !reflect.DeepEqual(expectedTimesheet, actualTimesheet) {
		t.Errorf("Failed to process row - timesheets don't match. \n Expected: %v \n Actual: %v", expectedTimesheet, actualTimesheet)
	}
}

func TestProcessRowDoesNotAddShift(t *testing.T) {
	expectedTimesheet := TimesheetConstants.Timesheet{
		Shifts: []TimesheetConstants.EmployeeShift{},
	}
	shift := createShift("1", "", "", "", "", "")
	schedule := [][]interface{}{shift}

	timesheetProcessor := New("2")
	timesheetProcessor.ProcessRow(schedule[0])
	actualTimesheet := timesheetProcessor.GetTimesheet()

	if !reflect.DeepEqual(expectedTimesheet, actualTimesheet) {
		t.Errorf("Failed to process row - timesheets don't match. \n Expected: %v \n Actual: %v", expectedTimesheet, actualTimesheet)
	}
}
