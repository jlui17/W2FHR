package SharedConstants

import (
	"errors"
	"os"
)

var (
	ALLOW_ORIGINS_HEADER = map[string]string{"Access-Control-Allow-Origin": "*"}
)

type ErrorMessages string

const (
	INCLUDE_AUTH_HEADER_ERROR = "Please include Authorization header in request."

	COGNITO_ATTENDANTS_GROUP_ENV_KEY  = "COGNITO_ATTENDANTS_GROUP_NAME"
	COGNITO_SUPERVISORS_GROUP_ENV_KEY = "COGNITO_SUPERVISORS_GROUP_NAME"
	COGNITO_MANAGERS_GROUP_ENV_KEY    = "COGNITO_MANAGERS_GROUP_NAME"
)

var (
	ErrNotABearerToken  = errors.New("please provide a bearer token")
	ErrInvalidIdToken   = errors.New("invalid idToken")
	ErrEmployeeNotFound = errors.New("Employee not found.")
	ErrInternal         = errors.New("Something went wrong. Please try again later or contact a manager.")

	AttendantUserGroup  = os.Getenv(COGNITO_ATTENDANTS_GROUP_ENV_KEY)
	SupervisorUserGroup = os.Getenv(COGNITO_SUPERVISORS_GROUP_ENV_KEY)
	ManagerUserGroup    = os.Getenv(COGNITO_MANAGERS_GROUP_ENV_KEY)
)
