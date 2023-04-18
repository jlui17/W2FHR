package GoogleClient

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
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

type GoogleSheetsService interface {
	GetAvailability() ([][]interface{}, error)
	CanUpdateAvailability() (bool, error)
}

type SheetsService struct{}

var (
	sheetsService *sheets.Service
)

func New() (*SheetsService, error) {
	err := ConnectSheetsServiceIfNecessary()
	return &SheetsService{}, err
}

func (s *SheetsService) GetAvailability() ([][]interface{}, error) {
	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_TIMESHEET_GET_RANGE

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return [][]interface{}{}, err
	}

	return response.Values, nil
}

func (s *SheetsService) CanUpdateAvailability() (bool, error) {
	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_CAN_UPDATE_CELL

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return false, err
	}

	if response.Values[0][0].(string) == "TRUE" {
		return false, nil
	}

	return true, nil
}

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
