package AuthConstants

const (
	STAFF_LIST_SHEET_ID                = "1UWg4SPcPf6wSLNIW-u_KRt1HCHj4yhvqdQyfryNj51I"
	EMAIL_COL                          = "F"
	EMPLOYEE_ID_COL                    = "A"
	EMAIL_GET_RANGE                    = "F2:F"
	EMPLOYEE_ID_GET_RANGE              = "A2:A"
	STAFF_LIST_SHEET_NAME              = "Total Staff"
	STAFF_LIST_INFO_INCONSISTENT_ERROR = "number of emails and employee ids are not the same"
)

type STAFF_LIST_INFO struct {
	Emails      []interface{}
	EmployeeIds []interface{}
}

var (
	DEFAULT_STAFF_LIST_INFO = &STAFF_LIST_INFO{
		Emails:      []interface{}{},
		EmployeeIds: []interface{}{},
	}
)