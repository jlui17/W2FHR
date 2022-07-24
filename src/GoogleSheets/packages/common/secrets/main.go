package secrets

import (
	"github.com/aws/aws-secretsmanager-caching-go/secretcache"
)

var (
	secretClient, _ = secretcache.New()
)

func GetGoogleSheetsApiKey() string {
	apiKey, _ := secretClient.GetSecretString("API_KEY")
	return apiKey
}
