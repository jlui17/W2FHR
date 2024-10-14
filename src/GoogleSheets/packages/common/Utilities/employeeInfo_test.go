package EmployeeInfo

import (
	"testing"

	"github.com/golang-jwt/jwt/v4"
)

const (
	expectedEmail      = "test email"
	expectedGroup      = "some group"
	expectedEmployeeId = "a cool id"
)

var (
	signingKey = []byte("super secret key")
)

func getTestToken() (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":             expectedEmail,
		"cognito:groups":    []interface{}{expectedGroup},
		"custom:employeeId": expectedEmployeeId,
	})

	res, err := token.SignedString(signingKey)
	if err != nil {
		return "", nil
	}

	return res, nil
}

func TestGetIdTokenFromBearerToken(t *testing.T) {
	expectedIdToken, err := getTestToken()

	_, err = getIdTokenFromBearerToken("111111")
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

func TestParseIdToken(t *testing.T) {
	token, err := getTestToken()
	_, err = parseIdToken(token)
	if err != nil {
		t.Error(err)
	}
}

func TestCreateEmployeeInfoFromBearerToken(t *testing.T) {
	token, err := getTestToken()
	bearerToken := "bearer " + token

	employeeInfo, err := New(bearerToken)
	if err != nil {
		t.Error(err)
	}

	if employeeInfo.Id != expectedEmployeeId {
		t.Errorf("Expected employeeId to be w2fnm170018, got %s", employeeInfo.Id)
	}

	if employeeInfo.Email != expectedEmail {
		t.Errorf("Expected employeeId to be justinlui.wun2free@gmail.com, got %s", employeeInfo.Email)
	}

	if employeeInfo.Group != expectedGroup {
		t.Errorf("Expected group to be 'manager', got %s", employeeInfo.Group)
	}
}
