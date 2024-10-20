package EmployeeInfo

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"os"
	"reflect"
	"slices"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

var (
	signingKey     = []byte("super secret key")
	keysToCheckMap = map[string]interface{}{
		emailClaimsKey:           "some email",
		IdClaimsKey:              "some id",
		groupsClaimsKey:          []interface{}{"some group"},
		AvailabilityRowClaimsKey: "1",
	}
)

func TestGetIdTokenFromBearerToken(t *testing.T) {
	expectedIdToken := getTestToken(jwt.MapClaims{
		emailClaimsKey: keysToCheckMap[emailClaimsKey],
	})

	_, err := getIdTokenFromBearerToken("111111")
	if err == nil {
		t.Error("id token too short, should've failed")
	}

	_, err = getIdTokenFromBearerToken(expectedIdToken)
	if err == nil {
		t.Error("not a bearer token, should've failed")
	}

	actualIdToken, err := getIdTokenFromBearerToken("bearer " + expectedIdToken)
	if err != nil {
		t.Error("valid bearer token, should've succeeded")
	}

	if actualIdToken != expectedIdToken {
		t.Error("expected != parsed")
	}
}

func TestCreateEmployeeInfoFromBearerToken(t *testing.T) {
	defaultGroup := "default group"
	os.Setenv(SharedConstants.COGNITO_ATTENDANTS_GROUP_ENV_KEY, defaultGroup)

	claimsForAvailabilityRowTest := map[string]interface{}{
		emailClaimsKey:           "some email",
		IdClaimsKey:              "some id",
		groupsClaimsKey:          []interface{}{"some group"},
		AvailabilityRowClaimsKey: "some non integer",
	}

	var tests = []struct {
		name        string
		input       jwt.Claims
		expected    EmployeeInfo
		expectedErr error
	}{
		{
			name:        "Error when user doesn't have employee email",
			input:       generateClaimsAndIngoreKeys([]string{emailClaimsKey}),
			expected:    EmployeeInfo{},
			expectedErr: SharedConstants.ErrInternal,
		},
		{
			name:        "Error when user doesn't have employee id",
			input:       generateClaimsAndIngoreKeys([]string{IdClaimsKey}),
			expected:    EmployeeInfo{},
			expectedErr: SharedConstants.ErrInternal,
		},
		{
			name:        "Error when user doesn't have availability row",
			input:       generateClaimsAndIngoreKeys([]string{AvailabilityRowClaimsKey}),
			expected:    EmployeeInfo{},
			expectedErr: SharedConstants.ErrInternal,
		},
		{
			name:        "Error when user availability row isn't an int",
			input:       generateClaims(claimsForAvailabilityRowTest),
			expected:    EmployeeInfo{},
			expectedErr: SharedConstants.ErrInternal,
		},
		{
			name:  "When no groups in token, default to attendants",
			input: generateClaimsAndIngoreKeys([]string{groupsClaimsKey}),
			expected: EmployeeInfo{
				Email:           keysToCheckMap[emailClaimsKey].(string),
				Id:              keysToCheckMap[IdClaimsKey].(string),
				Group:           defaultGroup,
				AvailabilityRow: 1,
			},
			expectedErr: nil,
		},
		{
			name:  "When everything is present in the token, correctly get the info",
			input: generateClaimsAndIngoreKeys([]string{}),
			expected: EmployeeInfo{
				Email:           keysToCheckMap[emailClaimsKey].(string),
				Id:              keysToCheckMap[IdClaimsKey].(string),
				Group:           keysToCheckMap[groupsClaimsKey].([]interface{})[0].(string),
				AvailabilityRow: 1,
			},
			expectedErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token := getTestToken(tt.input)
			ans, err := New("bearer " + token)

			if tt.expectedErr != nil && tt.expectedErr != err {
				t.Errorf("Expected error %s, got %s", tt.expectedErr, err)
			}

			if !reflect.DeepEqual(ans, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, ans)
			}

		})
	}
}

func generateClaimsAndIngoreKeys(toIgnore []string) jwt.Claims {
	claims := map[string]interface{}{}
	for k, v := range keysToCheckMap {
		if slices.Contains(toIgnore, k) {
			continue
		}
		claims[k] = v
	}
	return generateClaims(claims)
}

func generateClaims(claims map[string]interface{}) jwt.Claims {
	res := jwt.MapClaims{}
	for k, v := range claims {
		res[k] = v
	}
	return res
}

func getTestToken(claims jwt.Claims) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	res, _ := token.SignedString(signingKey)
	return res
}
