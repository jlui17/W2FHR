package SharedConstants

import (
	"errors"
	"fmt"
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

	GoogleSheetsRangeTemplate = "'%s'!%s%d:%s%d"
)

var (
	ErrNotABearerToken  = errors.New("please provide a bearer token")
	ErrInvalidIdToken   = errors.New("invalid idToken")
	ErrEmployeeNotFound = errors.New("Employee not found.")
	ErrInternal         = errors.New("Something went wrong. Please try again later or contact a manager.")
	ErrInvalidMethod    = errors.New("Invalid method.")
	ErrInvalidRequest   = errors.New("Invalid request.")

	AttendantUserGroup  = os.Getenv(COGNITO_ATTENDANTS_GROUP_ENV_KEY)
	SupervisorUserGroup = os.Getenv(COGNITO_SUPERVISORS_GROUP_ENV_KEY)
	ManagerUserGroup    = os.Getenv(COGNITO_MANAGERS_GROUP_ENV_KEY)
)

func ErrUnauthorized(msg string) error {
	return errors.New("Unauthorized: " + msg)
}

func DToStrArr(arr []interface{}) []string {
	converted := make([]string, len(arr))
	for i, v := range arr {
		converted[i] = v.(string)
	}
	return converted
}

func DDToStrArr(arr [][]interface{}) [][]string {
	converted := make([][]string, len(arr))
	for i, v := range arr {
		converted[i] = DToStrArr(v)
	}
	return converted
}

func Flatten(arr [][]interface{}) []interface{} {
	flat := make([]interface{}, 0)
	for _, subArr := range arr {
		flat = append(flat, subArr...)
	}
	return flat
}

func All2DArraysSameLength[T any](arrs ...*[][]T) error {
	if len(arrs) == 0 {
		return nil
	}

	lens := make([][]int, len(arrs))

	for i, outer := range arrs {
		if outer == nil {
			return fmt.Errorf("array %d is nil", i)
		}

		lens[i] = make([]int, len(*outer))
		for j, inner := range *outer {
			lens[i][j] = len(inner)
		}
	}

	err := errors.New(fmt.Sprintf("arrays differ in length: %v", lens))
	// Compare outer lengths
	outerLen := len(lens[0])
	for _, lengths := range lens {
		if len(lengths) != outerLen {
			return err
		}
	}

	// Compare inner lengths (if outer arrays are not empty)
	if outerLen > 0 {
		for i := 0; i < outerLen; i++ {
			innerLen := lens[0][i]
			for _, lengths := range lens {
				if lengths[i] != innerLen {
					return err
				}
			}
		}
	}

	return nil
}
