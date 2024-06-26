package SharedConstants

import "errors"

var (
	ALLOW_ORIGINS_HEADER = map[string]string{"Access-Control-Allow-Origin": "*"}
)

type ErrorMessages string

const (
	NUM_OF_DATES              = 4
	INCLUDE_AUTH_HEADER_ERROR = "Please include Authorization header in request."
	NOT_VALID_REQUEST_ERROR   = "Not a valid request"
	INCLUDE_EMAIL_ERROR       = "Please include employee email in request."
)

var (
	ErrNotABearerToken        = errors.New("please provide a bearer token")
	ErrInvalidIdToken         = errors.New("invalid idToken")
	ErrNoEmployeeIdInToken    = errors.New("employeeId not found in idToken")
	ErrNoEmployeeEmailInToken = errors.New("email not found in idToken")
	ErrEmployeeNotFound       = errors.New("employee not found")
)
