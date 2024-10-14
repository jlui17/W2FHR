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
		emailClaimsKey:  "some email",
		idClaimsKey:     "some id",
		groupsClaimsKey: []interface{}{"some group"},
	}
)

func TestGetIdTokenFromBearerToken(t *testing.T) {
	expectedIdToken := getTestToken(jwt.MapClaims{
		"email":             keysToCheckMap[emailClaimsKey],
		"cognito:groups":    []interface{}{keysToCheckMap[groupsClaimsKey]},
		"custom:employeeId": keysToCheckMap[idClaimsKey],
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

	var tests = []struct {
		name        string
		input       jwt.Claims
		expected    EmployeeInfo
		expectedErr error
	}{
		{
			name:        "Error when user doesn't have employee email",
			input:       generateClaims([]string{emailClaimsKey}),
			expected:    EmployeeInfo{},
			expectedErr: SharedConstants.ErrNoEmployeeEmailInToken,
		},
		{
			name:        "Error when user doesn't have employee id",
			input:       generateClaims([]string{idClaimsKey}),
			expected:    EmployeeInfo{},
			expectedErr: SharedConstants.ErrNoEmployeeIdInToken,
		},
		{
			name:  "When no groups in token, default to attendants",
			input: generateClaims([]string{groupsClaimsKey}),
			expected: EmployeeInfo{
				Email: keysToCheckMap[emailClaimsKey].(string),
				Id:    keysToCheckMap[idClaimsKey].(string),
				Group: defaultGroup,
			},
			expectedErr: nil,
		},
		{
			name:  "When everything is present in the token, correctly get the info",
			input: generateClaims([]string{}),
			expected: EmployeeInfo{
				Email: keysToCheckMap[emailClaimsKey].(string),
				Id:    keysToCheckMap[idClaimsKey].(string),
				Group: keysToCheckMap[groupsClaimsKey].([]interface{})[0].(string),
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

func generateClaims(toIgnore []string) jwt.Claims {
	res := jwt.MapClaims{}
	for k, v := range keysToCheckMap {
		if slices.Contains(toIgnore, k) {
			continue
		}
		res[k] = v
	}
	return res
}

func getTestToken(claims jwt.Claims) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	res, _ := token.SignedString(signingKey)
	return res
}
