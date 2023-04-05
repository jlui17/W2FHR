package GoogleClient

import (
	"os"
	"testing"
)

const mOCK_G_SERVICE_CONFIG_JSON = "{\"type\":\"service_account\",\"project_id\":\"\",\"private_key_id\":\"\",\"private_key\":\"\",\"client_email\":\"\",\"client_id\":\"\",\"auth_uri\":\"\",\"token_uri\":\"\",\"auth_provider_x509_cert_url\":\"\",\"client_x509_cert_url\":\"\"}"

func beforeEach() {
	os.Setenv("G_SERVICE_CONFIG_JSON", mOCK_G_SERVICE_CONFIG_JSON)
}

func TestSuccessfullyConnectToSheets(t *testing.T) {
	beforeEach()

	sheetsService := GetSheetsService()
	if sheetsService != nil {
		t.Error("Sheets service should be unitialized")
	}

	err := ConnectSheetsServiceIfNecessary()
	if err != nil {
		t.Errorf("Error while trying to create Google Sheets Service: %s", err.Error())
	}

	sheetsService = GetSheetsService()
	if sheetsService == nil {
		t.Error("Sheets service should be initialized now")
	}
}

func TestSkipConnection(t *testing.T) {
	beforeEach()

	err := ConnectSheetsServiceIfNecessary()
	sheetsService := GetSheetsService()
	if err != nil {
		t.Errorf("Error while trying to create Google Sheets Service: %s", err.Error())
	}

	newSheetsService := GetSheetsService()
	if newSheetsService == nil {
		t.Errorf("Failed to connect to sheets")
	}

	err = ConnectSheetsServiceIfNecessary()
	if err != nil {
		t.Errorf("Error while trying to create Google Sheets Service: %s", err.Error())
	}

	if sheetsService != newSheetsService {
		t.Error("Failed to skip connection")
	}
}
