package TokenUtil

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"errors"
	"log"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

var jwtParser *jwt.Parser = jwt.NewParser()

func getIdTokenFromBearerToken(bearerToken string) (string, error) {
	if len(bearerToken) < 7 {
		return "", errors.New(SharedConstants.INVALID_ID_TOKEN_ERROR)
	}

	splitBearerToken := strings.Split(bearerToken, " ")
	if len(splitBearerToken) != 2 {
		return "", errors.New(SharedConstants.NOT_A_BEARER_TOKEN_ERROR)
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
