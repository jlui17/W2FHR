package SharedConstants

var (
	ALLOW_ORIGINS_HEADER = map[string]string{"Access-Control-Allow-Origin": "*"}
)

type ErrorMessages string

const (
	NUM_OF_DATES                = 4
	EMPLOYEE_NOT_FOUND_ERROR    = "employee not found"
	INVALID_ID_TOKEN_ERROR      = "invalid idToken"
	EMPLOYEE_ID_NOT_FOUND_ERROR = "employeeId not found in idToken"
	INCLUDE_AUTH_HEADER_ERROR   = "Please include Authorization header in request."
	NOT_VALID_REQUEST_ERROR     = "Not a valid request"
	INCLUDE_EMAIL_ERROR         = "Please include employee email in request."
	NOT_A_BEARER_TOKEN_ERROR    = "please provide a bearer token"
)
