package EmployeeInfo

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"errors"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

const (
	emailClaimsKey           string = "email"
	IdClaimsKey              string = "custom:employeeId"
	groupsClaimsKey          string = "cognito:groups"
	AvailabilityRowClaimsKey string = "custom:availabilityRow"
)

var (
	jwtParser *jwt.Parser = jwt.NewParser()

	errIdTokenWrongFormat = errors.New("id token format changed")
)

type EmployeeInfo struct {
	Email           string
	Id              string
	Group           string
	AvailabilityRow int
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
	email, ok := claims[emailClaimsKey]
	if !ok {
		log.Print("[ERROR] user doesn't have email attribute")
		return EmployeeInfo{}, SharedConstants.ErrInternal
	}

	employeeId, ok := claims[IdClaimsKey]
	if !ok {
		log.Printf("[ERROR] %s doesn't have employeeId attribute", email)
		return EmployeeInfo{}, SharedConstants.ErrInternal
	}

	groups, exists := claims[groupsClaimsKey]
	if !exists {
		log.Printf("[ERROR] %s doesn't have a group attribute", email)
		groups = []interface{}{os.Getenv(SharedConstants.COGNITO_ATTENDANTS_GROUP_ENV_KEY)}
	}
	groups, ok = groups.([]interface{})
	if !ok {
		log.Printf("[ERROR] for some weird reason, %s groups is not a string list", email)
		return EmployeeInfo{}, SharedConstants.ErrInternal
	}
	actualGroups := groups.([]interface{})
	if len(actualGroups) < 1 {
		log.Printf("[ERROR] no groups for %s", email)
		return EmployeeInfo{}, SharedConstants.ErrInternal
	}

	availabilityRow, ok := claims[AvailabilityRowClaimsKey]
	if !ok {
		log.Printf("[ERROR] %s doesn't have availability row attribute", email)
		return EmployeeInfo{}, SharedConstants.ErrInternal
	}
	availabilityRowAsInt, err := strconv.Atoi(availabilityRow.(string))
	if err != nil {
		log.Printf("[ERROR] %s availability row isn't a string WTF: %s", email, availabilityRow.(string))
		return EmployeeInfo{}, SharedConstants.ErrInternal
	}

	return EmployeeInfo{
		Id:              employeeId.(string),
		Email:           email.(string),
		Group:           actualGroups[0].(string),
		AvailabilityRow: availabilityRowAsInt,
	}, nil
}

func getIdTokenFromBearerToken(bearerToken string) (string, error) {
	if len(bearerToken) < 7 {
		return "", SharedConstants.ErrInvalidIdToken
	}

	splitBearerToken := strings.Split(bearerToken, " ")
	if len(splitBearerToken) != 2 {
		log.Print("[ERROR] token is not a bearer token")
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
