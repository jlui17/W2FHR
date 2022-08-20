package AvailabilityConstants

type EMPLOYEE_AVAILABILITY struct {
	Day1 bool `json:"Day1"`
	Day2 bool `json:"Day2"`
	Day3 bool `json:"Day3"`
	Day4 bool `json:"Day4"`
}

const (
	EMPLOYEE_AVAILABILITY_NOT_FOUND = "NOT_FOUND"
	AVAILABILITY_SHEET_ID           = "1nomP3VKJxYewKICTwtPj464uZLclPEBgLv4i-6PPtSY"
	AVAILABILITY_SHEET_GET_RANGE    = "Links!A2:J"
)

var DEFAULT_EMPLOYEE_AVAILABILITY = EMPLOYEE_AVAILABILITY{
	Day1: false,
	Day2: false,
	Day3: false,
	Day4: false,
}
