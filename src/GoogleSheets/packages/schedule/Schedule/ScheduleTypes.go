package Schedule

type ScheduleMetadata struct {
	ShiftTitles    []string `json:"shiftTitles"`
	ShiftTimes     []string `json:"shiftTimes"`
	BreakDurations []string `json:"breakDurations"`
}
