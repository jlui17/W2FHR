package GoogleClient

import (
	"testing"
)

func TestGetReadOnlyService(t *testing.T) {
	_, err := GetReadOnlyService()
	if err != nil {
		t.Errorf("Found error while trying to create Google Sheets Service: %s", err.Error())
	}
}

func TestGetReadWriteService(t *testing.T) {
	_, err := GetReadWriteService()
	if err != nil {
		t.Errorf("Found error while trying to create Google Sheets Service: %s", err.Error())
	}
}
