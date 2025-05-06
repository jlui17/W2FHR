package LoginEmployee

import (
	CognitoGroupAuthorizer "GoogleSheets/packages/common"
	SharedConstants "GoogleSheets/packages/common/Constants"
	"GoogleSheets/packages/common/Constants/AuthConstants"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"errors"
	"fmt"
	"log"

	"context"
	"encoding/json"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

const (
	availability   string = "availability"
	upcomingShifts string = "upcomingShifts"
	shiftHistory   string = "shiftHistory"
	schedule       string = "schedule"
	scheduling     string = "scheduling"
)

var (
	cognitoGroupAuthorizer = CognitoGroupAuthorizer.New(SharedConstants.ManagerUserGroup)
)

type AuthSession struct {
	IdToken      string   `json:"idToken"`
	RefreshToken string   `json:"refreshToken"`
	Features     []string `json:"features"`
}

func getFeaturesForUser(idToken string) ([]string, error) {
	employeeInfo, err := EmployeeInfo.New("bearer " + idToken)
	if err != nil {
		return []string{}, err
	}

	if cognitoGroupAuthorizer.IsAuthorizedForScheduling(&employeeInfo) && !cognitoGroupAuthorizer.IsAuthorized(employeeInfo.Group) {
		return []string{availability, upcomingShifts, shiftHistory, schedule, scheduling}, nil
	}

	switch employeeInfo.Group {
	case SharedConstants.SupervisorUserGroup:
		return []string{availability, upcomingShifts, shiftHistory, schedule}, nil
	case SharedConstants.ManagerUserGroup:
		return []string{availability, upcomingShifts, shiftHistory, schedule, scheduling}, nil
	default: // default to attendant
		return []string{availability, upcomingShifts, shiftHistory}, nil
	}
}

func HandleRequest(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var loginReq AuthConstants.LoginRequest
	err := json.Unmarshal([]byte(event.Body), &loginReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Invalid request body",
		}, nil
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		fmt.Println("configuration error,", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Internal server error",
		}, nil
	}
	svc := cognitoidentityprovider.NewFromConfig(cfg)

	var flow types.AuthFlowType
	params := map[string]string{}
	if loginReq.RefreshToken != nil {
		flow = "REFRESH_TOKEN"
		params["REFRESH_TOKEN"] = *loginReq.RefreshToken
		log.Printf("logging in via refresh token: %v", loginReq.RefreshToken)
	} else {
		flow = "USER_PASSWORD_AUTH"
		params["USERNAME"] = loginReq.Email
		params["PASSWORD"] = loginReq.Password
	}

	req := &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow:       flow,
		AuthParameters: params,
		ClientId:       aws.String(os.Getenv("COGNITO_CLIENT_ID")),
	}

	res, err := svc.InitiateAuth(ctx, req)
	if err != nil {
		log.Printf("[ERROR] Auth - error initiating authentication, err: %s", err)

		statusCode := 500
		errMsg := fmt.Sprintf("An error occurred during authentication: %v", err.Error())

		var userNotFound *types.UserNotFoundException
		var notAuthorized *types.NotAuthorizedException
		var notConfirmed *types.UserNotConfirmedException
		var passResetRequired *types.PasswordResetRequiredException
		var tooManyReqs *types.TooManyRequestsException
		if errors.As(err, &userNotFound) {
			statusCode = 404
			errMsg = "User does not exist."
		} else if errors.As(err, &notAuthorized) {
			statusCode = 400
			if flow == "REFRESH_TOKEN" {
				errMsg = "Please login again."
			} else {
				errMsg = "Incorrect username or password."
			}
		} else if errors.As(err, &notConfirmed) {
			statusCode = 400
			errMsg = "User is not confirmed."
		} else if errors.As(err, &passResetRequired) {
			statusCode = 400
			errMsg = "Password reset required for the user."
		} else if errors.As(err, &tooManyReqs) {
			statusCode = 400
			errMsg = "Too many requests. Please try again later."
		}

		return events.APIGatewayProxyResponse{
			StatusCode: statusCode,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errMsg,
		}, nil
	}
	log.Printf("[DEBUG] Successfully logged in. Result from AWS Cognito: %v", res.AuthenticationResult)

	features, err := getFeaturesForUser(*res.AuthenticationResult.IdToken)
	if err != nil {
		log.Printf("[ERROR] Login - failed to get employee info from ID token: %v, err: %s.", *res.AuthenticationResult.IdToken, err)
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       err.Error(),
		}, nil
	}

	var resp AuthSession = AuthSession{
		IdToken:  *res.AuthenticationResult.IdToken,
		Features: features,
	}
	if res.AuthenticationResult.RefreshToken != nil {
		resp.RefreshToken = *res.AuthenticationResult.RefreshToken
	}
	log.Printf("[DEBUG] Successfully logged in. AuthSession: %v", resp)
	authResultJSON, err := json.Marshal(resp)

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Error marshalling response",
		}, nil
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(authResultJSON),
	}, nil
}
