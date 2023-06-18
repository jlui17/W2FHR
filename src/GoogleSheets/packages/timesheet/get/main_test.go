package GetTimesheet

import (
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"reflect"
	"testing"
	"time"
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

func TestGetAllShiftsForEmployee(t *testing.T) {
	shift1 := createShift("1", "Shift 1", "Sunday, December 11, 2022", "10:00", "18:00", "1:00")
	shift2 := createShift("1", "Shift 2", "Monday, December 12, 2022", "10:00", "18:00", "1:00")
	shift3 := createShift("2", "Shift 3", "Sunday, December 11, 2022", "10:00", "18:00", "1:00")
	timesheet := [][]interface{}{shift1, shift2, shift3}

	expectedShift1 := TimesheetConstants.EmployeeShift{
		ShiftTitle: "Shift 1", Date: "Sunday, December 11, 2022", StartTime: "10:00", EndTime: "18:00", BreakDuration: "1:00",
	}
	expectedShift2 := TimesheetConstants.EmployeeShift{
		ShiftTitle: "Shift 2", Date: "Monday, December 12, 2022", StartTime: "10:00", EndTime: "18:00", BreakDuration: "1:00",
	}
	expectedShifts := TimesheetConstants.Timesheet{Shifts: []TimesheetConstants.EmployeeShift{expectedShift1, expectedShift2}}

	employeeShifts := getShiftsForEmployee("1", timesheet, false)

	if len(employeeShifts.Shifts) != len(expectedShifts.Shifts) {
		t.Errorf("Expected %d shifts, got %d", len(expectedShifts.Shifts), len(employeeShifts.Shifts))
	}

	if !reflect.DeepEqual(*employeeShifts, expectedShifts) {
		t.Errorf("Expected %v, got %v", expectedShifts, *employeeShifts)
	}
}

func TestGetUpcomingShiftsForEmployee(t *testing.T) {
	today := time.Now().Format(TimesheetConstants.DATE_FORMAT)
	tomorrow := time.Now().AddDate(0, 0, 1).Format(TimesheetConstants.DATE_FORMAT)
	yesterday := time.Now().AddDate(0, 0, -1).Format(TimesheetConstants.DATE_FORMAT)

	shift1 := createShift("1", "Shift 1", yesterday, "10:00", "18:00", "1:00")
	shift2 := createShift("1", "Shift 2", today, "10:00", "18:00", "1:00")
	shift3 := createShift("2", "Shift 3", today, "10:00", "18:00", "1:00")
	shift4 := createShift("1", "Shift 4", tomorrow, "10:00", "18:00", "1:00")
	masterTimesheet := [][]interface{}{shift1, shift2, shift3, shift4}

	expectedShift1 := TimesheetConstants.EmployeeShift{
		ShiftTitle: "Shift 2", Date: today, StartTime: "10:00", EndTime: "18:00", BreakDuration: "1:00",
	}
	expectedShift2 := TimesheetConstants.EmployeeShift{
		ShiftTitle: "Shift 4", Date: tomorrow, StartTime: "10:00", EndTime: "18:00", BreakDuration: "1:00",
	}
	expectedShifts := TimesheetConstants.Timesheet{Shifts: []TimesheetConstants.EmployeeShift{expectedShift1, expectedShift2}}

	employeeShifts := getShiftsForEmployee("1", masterTimesheet, true)

	if len(employeeShifts.Shifts) != len(expectedShifts.Shifts) {
		t.Errorf("Expected %d shifts, got %d", len(expectedShifts.Shifts), len(employeeShifts.Shifts))
	}

	if !reflect.DeepEqual(*employeeShifts, expectedShifts) {
		t.Errorf("Expected %v, got %v", expectedShifts, *employeeShifts)
	}
}
