package AuthConstants

const (
	STAFF_LIST_SHEET_ID                = "1kwvcsbcyHA5x__RoXzo1a-4b1zURwwCUuahCgNUtAJ8"
	EMPLOYEE_ID_COL                    = "A"
	EMAIL_GET_RANGE                    = "G2:G"
	EMPLOYEE_ID_GET_RANGE              = "A2:A"
	STAFF_LIST_SHEET_NAME              = "Total Staff"
	STAFF_LIST_INFO_INCONSISTENT_ERROR = "number of emails and employee ids are not the same"
)

type STAFF_LIST_INFO struct {
	Emails      []interface{}
	EmployeeIds []interface{}
}

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignUpResponse struct {
	NeedsConfirmation bool `json:"needsConfirmation"`
}

var (
	DEFAULT_STAFF_LIST_INFO = &STAFF_LIST_INFO{
		Emails:      []interface{}{},
		EmployeeIds: []interface{}{},
	}
)
