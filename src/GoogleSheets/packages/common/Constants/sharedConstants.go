package SharedConstants

import "errors"

var (
	ALLOW_ORIGINS_HEADER = map[string]string{"Access-Control-Allow-Origin": "*"}
)

type ErrorMessages string

const (
	NUM_OF_DATES = 4

	INCLUDE_AUTH_HEADER_ERROR = "Please include Authorization header in request."
	NOT_VALID_REQUEST_ERROR   = "Not a valid request"
	INCLUDE_EMAIL_ERROR       = "Please include employee email in request."

	COGNITO_ATTENDANTS_GROUP_ENV_KEY = "COGNITO_ATTENDANTS_GROUP_NAME"
)

var (
	ErrNotABearerToken  = errors.New("please provide a bearer token")
	ErrInvalidIdToken   = errors.New("invalid idToken")
	ErrEmployeeNotFound = errors.New("Employee not found.")
	ErrInternal         = errors.New("Something went wrong. Please try again later or contact a manager.")
)
