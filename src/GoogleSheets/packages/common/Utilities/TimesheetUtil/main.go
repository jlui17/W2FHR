package TimesheetUtil

import (
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"GoogleSheets/packages/common/Utilities/SharedUtil"
)

func ConvertShiftInterfaceSliceToStringSlice(shiftInterfaceSlice []interface{}) []string {
	shiftAsStringSlice := []string{}

	for _, shiftInterfaceValue := range shiftInterfaceSlice {
		shiftInterfaceAsString := shiftInterfaceValue.(string)
		shiftAsStringSlice = append(shiftAsStringSlice, shiftInterfaceAsString)
	}

	return shiftAsStringSlice
}

func convertUnformattedShiftToEmployeeShift(unformattedShift []string) *TimesheetConstants.EmployeeShift {
	return &TimesheetConstants.EmployeeShift{
		Date:          unformattedShift[SharedUtil.GetIndexOfColumn(TimesheetConstants.DATE_COLUMN)],
		ShiftTitle:    unformattedShift[SharedUtil.GetIndexOfColumn(TimesheetConstants.SHIFT_TITLE_COLUMN)],
		StartTime:     unformattedShift[SharedUtil.GetIndexOfColumn(TimesheetConstants.START_TIME_COLUMN)],
		EndTime:       unformattedShift[SharedUtil.GetIndexOfColumn(TimesheetConstants.END_TIME_COLUMN)],
		BreakDuration: unformattedShift[SharedUtil.GetIndexOfColumn(TimesheetConstants.BREAK_DURATION_COLUMN)],
	}
}

func FormatEmployeeShifts(unformattedEmployeeShifts *[][]string) *[]*TimesheetConstants.EmployeeShift {
	formattedEmployeeShifts := []*TimesheetConstants.EmployeeShift{}

	for i := 0; i < len(*unformattedEmployeeShifts); i++ {
		convertedShift := convertUnformattedShiftToEmployeeShift((*unformattedEmployeeShifts)[i])
		formattedEmployeeShifts = append(formattedEmployeeShifts, convertedShift)
	}

	return &formattedEmployeeShifts
}
