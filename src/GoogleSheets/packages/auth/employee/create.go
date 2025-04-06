package Authorization

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

var (
	client *cognitoidentityprovider.Client
)

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type SignUpResponse struct {
	NeedsConfirmation bool `json:"needsConfirmation"`
}

func SignUpEmployee(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var req SignUpRequest
	err := json.Unmarshal([]byte(event.Body), &req)
	if err != nil {
		log.Print("[ERROR] Auth wrong signReq structure")
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       "Invalid request body",
		}, nil
	}

	fmt.Printf("[INFO] Sign up request for: %s", req.Email)
	employeeInfoForSignUp, err := getEmployeeInfoForSignUp(req.Email)
	if err != nil {
		log.Printf("[ERROR] Auth failed to get employeeId, err: %s", err)
		code := 500
		if errors.Is(err, SharedConstants.ErrEmployeeNotFound) {
			code = 401
		}

		return events.APIGatewayProxyResponse{
			StatusCode: code,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       SharedConstants.ErrEmployeeNotFound.Error(),
		}, nil
	}

	fmt.Printf("[INFO] Auth - attempting to sign up employee! Email: %s, employee ID: %s", req.Email, employeeInfoForSignUp.Id)
	cognitoClientId := os.Getenv("COGNITO_CLIENT_ID")
	if cognitoClientId == "" {
		log.Print("[ERROR] Auth - cognito client id not available")
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
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
	if client == nil {
		client = cognitoidentityprovider.NewFromConfig(cfg)
	}

	signUpRes, err := doSignUp(ctx, req.Email, req.Password, employeeInfoForSignUp, cognitoClientId, client)
	if err != nil {
		log.Printf("[ERROR] Auth - error while signing up %s, err: %s", req.Email, err)
		status := 500
		errMsg := fmt.Sprintf("Error while signing up: %v", err.Error())

		var invalidPasswordErr *types.InvalidPasswordException
		var tooManyRequestsErr *types.TooManyRequestsException
		var usernameExistsErr *types.UsernameExistsException
		if errors.As(err, &invalidPasswordErr) {
			errMsg = "[ERROR] Auth - password validation not up to date on frontend"
		} else if errors.As(err, &tooManyRequestsErr) {
			status = 400
			errMsg = "You have tried to sign up too many times, please wait a while and try again later."
		} else if errors.As(err, &usernameExistsErr) {
			status = 400
			errMsg = "You already have an account. Please log in instead."
		}

		if status == 500 {
			log.Printf("[ERROR] Auth: %v", errMsg)
		}
		return events.APIGatewayProxyResponse{
			StatusCode: status,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errMsg,
		}, nil
	}
	log.Printf("[INFO] Auth - successfully signed up %s", req.Email)

	log.Printf("[INFO] Auth - attempting to add %s to group %s", req.Email, employeeInfoForSignUp.Group)
	cognitoPoolId := os.Getenv("COGNITO_POOL_ID")
	if cognitoPoolId == "" {
		log.Print("[ERROR] Auth - cognito pool id not available")
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, nil
	}

	apiResWithErr, err := AddUserToGroup(ctx, req.Email, employeeInfoForSignUp.Group, cognitoPoolId, client)
	if err != nil {
		return apiResWithErr, nil
	}

	response := SignUpResponse{
		NeedsConfirmation: !(signUpRes.UserConfirmed),
	}
	reponseBody, _ := json.Marshal(response)
	return events.APIGatewayProxyResponse{
		StatusCode: 201,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       string(reponseBody),
	}, nil
}

func doSignUp(ctx context.Context, email string, password string, info *EmployeeInfoForSignUp, cognitoClientId string, client *cognitoidentityprovider.Client) (*cognitoidentityprovider.SignUpOutput, error) {
	employeeIdKey := "custom:employeeId"
	availabilityRowKey := "custom:availabilityRow"
	availabilityRowAsStr := strconv.Itoa(info.AvailabilitySheetRow)
	attributes := []types.AttributeType{
		{
			Name:  &employeeIdKey,
			Value: &info.Id,
		},
		{
			Name:  &availabilityRowKey,
			Value: &availabilityRowAsStr,
		},
	}
	signUpInput := &cognitoidentityprovider.SignUpInput{
		ClientId:       &cognitoClientId,
		Username:       &email,
		Password:       &password,
		UserAttributes: attributes,
	}

	signUpOutput, err := client.SignUp(ctx, signUpInput)
	if err != nil {
		return &cognitoidentityprovider.SignUpOutput{}, err
	}

	return signUpOutput, nil
}

func AddUserToGroup(ctx context.Context, email string, group string, userPoolId string, client *cognitoidentityprovider.Client) (events.APIGatewayProxyResponse, error) {
	req := &cognitoidentityprovider.AdminAddUserToGroupInput{
		GroupName:  &group,
		Username:   &email,
		UserPoolId: &userPoolId,
	}

	_, err := client.AdminAddUserToGroup(ctx, req)
	if err != nil {
		log.Printf("[ERROR] Auth - error while adding %s to group %s, err: %s", email, group, err)
		status := 500
		errMsg := fmt.Sprintf("Error while adding user to group: %v", err)

		var tooManyRequestsErr *types.TooManyRequestsException
		if errors.As(err, &tooManyRequestsErr) {
			status = 400
			errMsg = "You have tried to sign up too many times, please wait a while and try again later."
		}

		return events.APIGatewayProxyResponse{
			StatusCode: status,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			Body:       errMsg,
		}, nil
	}
	return events.APIGatewayProxyResponse{}, nil
}
