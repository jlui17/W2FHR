package GoogleClient

import (
	"os"
	"testing"
)

const MOCK_G_SERVICE_CONFIG_JSON = "{\"type\":\"service_account\",\"project_id\":\"\",\"private_key_id\":\"\",\"private_key\":\"\",\"client_email\":\"\",\"client_id\":\"\",\"auth_uri\":\"\",\"token_uri\":\"\",\"auth_provider_x509_cert_url\":\"\",\"client_x509_cert_url\":\"\"}"

func beforeEach() {
	os.Setenv("G_SERVICE_CONFIG_JSON", MOCK_G_SERVICE_CONFIG_JSON)
}

func TestSuccessfullyConnectToSheets(t *testing.T) {
	beforeEach()

	sheetsService, err := New()
	if err != nil {
		t.Errorf("Error while creating sheets service: %s", err)
	}
	if sheetsService == nil {
		t.Error("Sheets service should be unitialized")
	}
}

func TestSkipConnection(t *testing.T) {
	beforeEach()

	sheetsService, err := New()
	if err != nil {
		t.Errorf("Error while creating sheets service: %s", err)
	}
	if err != nil {
		t.Errorf("Error while trying to create Google Sheets Service: %s", err.Error())
	}

	newSheetsService, err := New()
	if err != nil {
		t.Errorf("Error while creating NEW sheets service: %s", err)
	}
	if newSheetsService == nil {
		t.Errorf("Failed to connect to sheets")
	}

	if sheetsService != newSheetsService {
		t.Error("Failed to skip connection")
	}
}
