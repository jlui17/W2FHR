package GoogleClient

import (
	"context"
	"os"

	"google.golang.org/api/sheets/v4"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

const (
	READ_ONLY_SCOPE  = "https://www.googleapis.com/auth/spreadsheets.readonly"
	READ_WRITE_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
)

var (
	sheetsService *sheets.Service
)

func GetSheetsService() *sheets.Service {
	return sheetsService
}

func ConnectSheetsServiceIfNecessary() error {
	if sheetsService != nil {
		return nil
	}

	token, err := google.JWTConfigFromJSON([]byte(os.Getenv("G_SERVICE_CONFIG_JSON")), "https://www.googleapis.com/auth/spreadsheets")
	if err != nil {
		return err
	}

	client := token.Client(context.Background())
	service, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return err
	}

	sheetsService = service
	return nil
}
