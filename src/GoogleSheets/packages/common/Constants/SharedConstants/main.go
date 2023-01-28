package SharedConstants

var (
	ALLOW_ORIGINS_HEADER = map[string]string{"Access-Control-Allow-Origin": "*"}
)

type ErrorMessages string

const (
	NUM_OF_DATES             = 4
	EMPLOYEE_NOT_FOUND_ERROR = "employee not found"
	INVALID_ID_TOKEN_ERROR   = "invalid idToken"
	EMPLOYEE_ID_NOT_FOUND    = "employeeId not found in idToken"
)
