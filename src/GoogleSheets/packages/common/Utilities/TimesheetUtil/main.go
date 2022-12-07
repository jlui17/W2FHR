package TimesheetUtil

import (
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
)

func ConvertShiftInterfaceSliceToStringSlice(shiftInterfaceSlice *[]interface{}) []string {
	shiftAsStringSlice := []string{}

	for i := 0; i < len(*shiftInterfaceSlice); i++ {
		shiftInterfaceAsString := (*shiftInterfaceSlice)[i].(string)
		shiftAsStringSlice = append(shiftAsStringSlice, shiftInterfaceAsString)
	}

	return shiftAsStringSlice
}

func convertUnformattedShiftToEmployeeShift(unformattedShift []string) *TimesheetConstants.EmployeeShift {
	return &TimesheetConstants.EmployeeShift{
		Date:          unformattedShift[3],
		ShiftTitle:    unformattedShift[4],
		StartTime:     unformattedShift[7],
		EndTime:       unformattedShift[8],
		BreakDuration: unformattedShift[9],
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
