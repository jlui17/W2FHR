package Schedule

type Metadata struct {
	ShiftTitles         []string `json:"shiftTitles"`
	ShiftTimes          []string `json:"shiftTimes"`
	BreakDurations      []string `json:"breakDurations"`
	EmployeeNamesAndIds []string `json:"employeeNamesAndIds"`
}
