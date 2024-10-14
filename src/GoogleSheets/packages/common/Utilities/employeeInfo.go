package EmployeeInfo

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"errors"
	"log"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

const (
	emailClaimsKey  = "email"
	idClaimsKey     = "custom:employeeId"
	groupsClaimsKey = "cognito:groups"
)

var (
	jwtParser *jwt.Parser = jwt.NewParser()

	errIdTokenWrongFormat = errors.New("id token format changed")
)

type EmployeeInfo struct {
	Email string
	Id    string
	Group string
}

func New(bearerToken string) (EmployeeInfo, error) {
	idToken, err := getIdTokenFromBearerToken(bearerToken)
	if err != nil {
		log.Printf("[ERROR] invalid token provided, err: %s", err)
		return EmployeeInfo{}, err
	}

	decodedIdToken, err := parseIdToken(idToken)
	if err != nil {
		log.Printf("[ERROR] failed to get idToken, err: %s", err)
		return EmployeeInfo{}, err
	}

	claims := decodedIdToken.Claims.(jwt.MapClaims)
	employeeId, ok := claims[idClaimsKey]
	if !ok {
		log.Print("[ERROR] user doesn't have employeeId attribute")
		return EmployeeInfo{}, SharedConstants.ErrNoEmployeeIdInToken
	}

	email, ok := claims[emailClaimsKey]
	if !ok {
		log.Print("[ERROR] user doesn't have email attribute")
		return EmployeeInfo{}, SharedConstants.ErrNoEmployeeEmailInToken
	}

	groups, exists := claims[groupsClaimsKey]
	if !exists {
		log.Print("[ERROR] user doesn't have a group attribute")
		groups = []interface{}{os.Getenv(SharedConstants.COGNITO_ATTENDANTS_GROUP_ENV_KEY)}
	}
	groups, ok = groups.([]interface{})
	if !ok {
		log.Print("[ERROR] for some weird reason, groups is not a string list")
		return EmployeeInfo{}, SharedConstants.ErrNoCognitoGroupInToken
	}
	actualGroups := groups.([]interface{})
	if len(actualGroups) < 1 {
		log.Print("[ERROR] no groups for user")
		return EmployeeInfo{}, SharedConstants.ErrNoCognitoGroupInToken
	}

	return EmployeeInfo{
		Id:    employeeId.(string),
		Email: email.(string),
		Group: actualGroups[0].(string),
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
	decodedIdToken, _, err := jwtParser.ParseUnverified(idToken, jwt.MapClaims{}) // Cognito Authorizer will verify idToken, we just need to get attributes from token
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return decodedIdToken, nil
}
