package googleClient

import (
	"context"
	"encoding/json"
	"net/http"
	"os"

	"golang.org/x/oauth2/google"
	"golang.org/x/oauth2/jwt"
)

type credentialConfig struct {
	CredentialType      string `json:"type"`
	ProjectId           string `json:"project_id"`
	PrivateKeyId        string `json:"private_key_id"`
	PrivateKey          string `json:"private_key"`
	ClientEmail         string `json:"client_email"`
	ClientId            string `json:"client_id"`
	AuthUri             string `json:"auth_uri"`
	TokenUri            string `json:"token_uri"`
	AuthProviderCertUrl string `json:"auth_provid09_cert_url"`
	ClientCertUrl       string `json:"client_x509_cert_url"`
}

var (
	config = credentialConfig{
		CredentialType:      "service_account",
		ProjectId:           os.Getenv("PROJECT_ID"),
		PrivateKeyId:        os.Getenv("PRIVATE_KEY_ID"),
		PrivateKey:          os.Getenv("PRIVATE_KEY"),
		ClientEmail:         os.Getenv("CLIENT_EMAIL"),
		ClientId:            os.Getenv("CLIENT_ID"),
		AuthUri:             os.Getenv("AUTH_URI"),
		TokenUri:            os.Getenv("TOKEN_URI"),
		AuthProviderCertUrl: os.Getenv("AUTH_PROVIDER_CERT_URL"),
		ClientCertUrl:       os.Getenv("CLIENT_CERT_URL"),
	}
)

func getConfig() (*jwt.Config, error) {
	configToByte, err := json.Marshal(config)
	if err != nil {
		return nil, err
	}

	googleConfig, err := google.JWTConfigFromJSON(configToByte)
	if err != nil {
		return nil, err
	}

	return googleConfig, nil
}

func GetClient() (*http.Client, error) {
	config, err := getConfig()
	if err != nil {
		return nil, err
	}

	return config.Client(context.Background()), nil
}
