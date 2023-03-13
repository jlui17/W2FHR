package TokenUtil

import (
	"testing"
)

const (
	expectedIdToken = "eyJraWQiOiI1Ukg1TGhzZzNCMlhvR1JBOVwvTDNzeTVKaDgyTUswNXA4MWtJMUZqUnNyST0iLCJhbGciOiJSUzI1NiJ9.eyJjdXN0b206ZW1wbG95ZWVJZCI6IncyZm5tMTcwMDE4Iiwic3ViIjoiOTk1NmE2NjgtNTBhYy00OTgxLThhNjItNWFhMGQzZTYxMDBkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1BWeTNLOGtBVyIsImNvZ25pdG86dXNlcm5hbWUiOiI5OTU2YTY2OC01MGFjLTQ5ODEtOGE2Mi01YWEwZDNlNjEwMGQiLCJvcmlnaW5fanRpIjoiMmFhZDRlNDctYzkxMy00ZDRjLWE5MjQtODMzZWYzMjllOGY1IiwiYXVkIjoiMWczZ25lZHEyaTZuYXFkanJic3ExMHBiNTQiLCJldmVudF9pZCI6ImRhMmVhZjM1LWJlNzQtNGJmNC1iYTZmLTQ5MjFiNDU3MzE0NiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjc0ODQxODYxLCJleHAiOjE2NzQ4NDU0NjEsImlhdCI6MTY3NDg0MTg2MSwianRpIjoiZjJhNTAxYzYtZjJhNy00NjYzLWE5ZTctMjQ3MjRkYjBmMjQ2IiwiZW1haWwiOiJqdXN0aW5sdWkud3VuMmZyZWVAZ21haWwuY29tIn0.nI5tWvclL6Kej8T4m9XJkCKzlP8k6NNlYh1weglC1VYI1O7ZQIy66RkJxOy8ZHNoJ_hUFDPSFXtCz4_kzrYtn2tu9oPyFNIZ55JT8hOKtKWaX1R3xEM9GUhEpL2cllsa0nTI7P2Te2SYP02nUxUghBXnUhC8sYLkkMg_KXVeSFTUfo45jeu1Ngx4Up9k7HnemONTh5hH629RmpviPpQxv2DRO6F6C7xyp-btlPLZnuAtcnMWFlA5fAcA5rkKVzTp0OEKQJFbdsIc_fb03XORRM65JIW754GdwrB2V_NQHZRNEzCdIS-p4uM0AdguF-dtBenOc1FpzCJxw3R4nOa4gQ"
)

func TestGetIdTokenFromBearerToken(t *testing.T) {

	_, err := getIdTokenFromBearerToken("111111")
	if err == nil {
		t.Error("id token too short, should've failed")
	}

	_, err = getIdTokenFromBearerToken(expectedIdToken)
	if err == nil {
		t.Error("not a bearer token, should've failed")
	}

	actualIdToken, err := getIdTokenFromBearerToken("bearer " + expectedIdToken)
	if err != nil {
		t.Error("valid bearer token, should've succeeded")
	}

	if actualIdToken != expectedIdToken {
		t.Error("expected != parsed")
	}
}

func TestParseIdToken(t *testing.T) {
	_, err := parseIdToken(expectedIdToken)
	if err != nil {
		t.Error(err)
	}
}

func TestGetEmployeeIdFromIdToken(t *testing.T) {
	bearerToken := "bearer " + expectedIdToken
	employeeId, err := GetEmployeeIdFromBearerToken(bearerToken)
	if err != nil {
		t.Error(err)
	}

	if employeeId != "w2fnm170018" {
		t.Errorf("Expected employeeId to be w2fnm170018, got %s", employeeId)
	}
}
