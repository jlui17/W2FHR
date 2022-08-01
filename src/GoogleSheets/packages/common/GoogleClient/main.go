package googleClient

import (
	configService "GoogleSheets/packages/common/ConfigService"
	"context"
	"net/http"

	"golang.org/x/oauth2/jwt"
)

const (
	READ_ONLY_SCOPE  = "https://www.googleapis.com/auth/spreadsheets.readonly"
	READ_WRITE_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
)

func getConfig(scope string) *jwt.Config {
	return &jwt.Config{
		Email:        configService.GetClientEmail(),
		PrivateKey:   []byte(configService.GetPrivateKey()),
		PrivateKeyID: configService.GetPrivateKeyId(),
		TokenURL:     configService.GetTokenUrl(),
		Scopes:       []string{scope},
	}
}

func GetReadOnlyClient() *http.Client {
	return getConfig(READ_ONLY_SCOPE).Client(context.Background())
}

func GetReadWriteClient() *http.Client {
	return getConfig(READ_WRITE_SCOPE).Client(context.Background())
}
