package TokenUtil

import (
	"errors"
	"log"

	"github.com/golang-jwt/jwt/v4"
)

func parseIdToken(idToken string) (*jwt.Token, error) {
	// parse idToken and skip claims validation
	decodedIdToken, _, err := new(jwt.Parser).ParseUnverified(idToken, jwt.MapClaims{})
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return decodedIdToken, nil
}

func GetEmployeeIdFromIdToken(idToken string) (string, error) {
	decodedIdToken, err := parseIdToken(idToken)
	if err != nil {
		return "", err
	}
	claims := decodedIdToken.Claims.(jwt.MapClaims)
	if employeeId, ok := claims["custom:employeeId"]; ok {
		return employeeId.(string), nil
	}
	return "", errors.New("employeeId not found in idToken")
}
