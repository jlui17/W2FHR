package EmployeeInfo

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"log"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

var jwtParser *jwt.Parser = jwt.NewParser()

type EmployeeInfo struct {
	email      string
	employeeId string
}

type EmployeeInfoProvider interface {
	New(bearerToken string) EmployeeInfoProvider
	GetEmail() string
	GetEmployeeId() string
}

func (e EmployeeInfo) GetEmail() string {
	return e.email
}

func (e EmployeeInfo) GetEmployeeId() string {
	return e.employeeId
}

func New(bearerToken string) (EmployeeInfo, error) {
	idToken, err := getIdTokenFromBearerToken(bearerToken)
	if err != nil {
		return EmployeeInfo{}, err
	}

	decodedIdToken, err := parseIdToken(idToken)
	if err != nil {
		return EmployeeInfo{}, err
	}

	claims := decodedIdToken.Claims.(jwt.MapClaims)
	employeeId, ok := claims["custom:employeeId"]
	if !ok {
		return EmployeeInfo{}, SharedConstants.ErrNoEmployeeIdInToken
	}

	email, ok := claims["email"]
	if !ok {
		return EmployeeInfo{}, SharedConstants.ErrNoEmployeeEmailInToken
	}

	return EmployeeInfo{
		employeeId: employeeId.(string),
		email:      email.(string),
	}, nil
}

func getIdTokenFromBearerToken(bearerToken string) (string, error) {
	if len(bearerToken) < 7 {
		return "", SharedConstants.ErrInvalidIdToken
	}

	splitBearerToken := strings.Split(bearerToken, " ")
	if len(splitBearerToken) != 2 {
		return "", SharedConstants.ErrNotABearerToken
	}

	// ["bearer", idToken]
	return splitBearerToken[1], nil
}

func parseIdToken(idToken string) (*jwt.Token, error) {
	decodedIdToken, _, err := jwtParser.ParseUnverified(idToken, jwt.MapClaims{})
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return decodedIdToken, nil
}
