package secrets

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
)

var (
	sess, sessErr = session.NewSession()
	secretClient  = secretsmanager.New(sess,
		aws.NewConfig().WithRegion("us-west-2"))
)

func GetGoogleSheetsApiKey() (string, error) {
	if sessErr != nil {
		return "", sessErr
	}
	secretId := "API_KEY"

	input := &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(secretId),
	}

	secretResult, err := secretClient.GetSecretValue(input)
	if err != nil {
		return "", err
	}

	return *secretResult.SecretString, nil
}
