package TimesheetProcessor

import (
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"GoogleSheets/packages/common/Utilities/SharedUtil"
	"GoogleSheets/packages/common/Utilities/TimesheetUtil"
)

type TimesheetProcessor struct {
	employeeId string
	timesheet  TimesheetConstants.Timesheet
}

func New(employeeId string) TimesheetProcessor {
	return TimesheetProcessor{
		employeeId: employeeId,
		timesheet: TimesheetConstants.Timesheet{
			Shifts: []TimesheetConstants.EmployeeShift{},
		},
	}
}

func (p *TimesheetProcessor) ProcessRow(row []interface{}) {
	employeeIdColumn := SharedUtil.GetIndexOfColumn(TimesheetConstants.EMPLOYEE_ID_COLUMN)
	if row[employeeIdColumn].(string) == p.employeeId {
		rowAsStrings := TimesheetUtil.ConvertShiftInterfaceSliceToStringSlice(row)
		employeeShift := TimesheetUtil.ConvertUnformattedShiftToEmployeeShift(rowAsStrings)
		p.timesheet.Shifts = append(p.timesheet.Shifts, employeeShift)
	}
}

func (p *TimesheetProcessor) GetTimesheet() TimesheetConstants.Timesheet {
	return p.timesheet
}
