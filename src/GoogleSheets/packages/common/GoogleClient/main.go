package GoogleClient

import (
	configService "GoogleSheets/packages/common/ConfigService"
	"context"

	"google.golang.org/api/sheets/v4"

	"golang.org/x/oauth2/jwt"
	"google.golang.org/api/option"
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

func GetReadOnlyService() (*sheets.Service, error) {
	client := getConfig(READ_ONLY_SCOPE).Client(context.Background())
	service, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return service, err
	}
	return service, nil
}

func GetReadWriteService() (*sheets.Service, error) {
	client := getConfig(READ_WRITE_SCOPE).Client(context.Background())
	service, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return service, err
	}
	return service, nil
}
