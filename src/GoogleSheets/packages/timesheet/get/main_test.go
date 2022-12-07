package GetTimesheet

import (
	"testing"
)

func TestGetMasterTimesheet(t *testing.T) {
	res, err := getMasterTimesheet()
	if err != nil {
		t.Errorf("Error: %v", err)
	}

	t.Log(res)
}
