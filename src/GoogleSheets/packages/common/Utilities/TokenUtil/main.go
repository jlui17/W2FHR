package TokenUtil

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"errors"
	"log"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

func getIdTokenFromBearerToken(bearerToken string) (string, error) {
	if len(bearerToken) < 7 {
		return "", errors.New(SharedConstants.INVALID_ID_TOKEN_ERROR)
	}

	idToken := strings.Split(bearerToken, " ")[1]
	return idToken, nil
}

func parseIdToken(idToken string) (*jwt.Token, error) {
	decodedIdToken, _, err := new(jwt.Parser).ParseUnverified(idToken, jwt.MapClaims{})
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return decodedIdToken, nil
}

func GetEmployeeIdFromBearerToken(bearerToken string) (string, error) {
	idToken, err := getIdTokenFromBearerToken(bearerToken)
	if err != nil {
		return "", err
	}

	decodedIdToken, err := parseIdToken(idToken)
	if err != nil {
		return "", err
	}
	claims := decodedIdToken.Claims.(jwt.MapClaims)
	if employeeId, ok := claims["custom:employeeId"]; ok {
		return employeeId.(string), nil
	}
	return "", errors.New(SharedConstants.EMPLOYEE_ID_NOT_FOUND_ERROR)
}
