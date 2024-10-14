package EmployeeInfo

import (
	"testing"
)

const (
	expectedIdToken = "eyJraWQiOiJob0FrTFdjQU9oOUM2U3p6NkZ6em9XK25HZ0F5SWFZWkxBZlB2a2d3bGc4PSIsImFsZyI6IlJTMjU2In0.eyJjdXN0b206ZW1wbG95ZWVJZCI6IncyZm5tMTcwMDE4Iiwic3ViIjoiMmFlNzRiNDYtNjQwZi00OGY4LTliYjUtYjQ1Yzg2NGY5OGU4IiwiY29nbml0bzpncm91cHMiOlsibWFuYWdlcnMiXSwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yXzhjR2hOd2xFTSIsImNvZ25pdG86dXNlcm5hbWUiOiIyYWU3NGI0Ni02NDBmLTQ4ZjgtOWJiNS1iNDVjODY0Zjk4ZTgiLCJvcmlnaW5fanRpIjoiNTg1MjU4MTMtN2Q2MC00ZDZmLWI1NGUtYmYwNGVhNjdjNTkyIiwiYXVkIjoiNGtranIwYXQzYmpvZWxpM3V1cHJxcnRocnUiLCJldmVudF9pZCI6Ijg2YzEzNGQ1LWViNjAtNGMzMC1hNTg3LTJlZjM4MTE2ZjM5MCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzI4ODY5MzkzLCJleHAiOjE3Mjg5NTU3OTMsImlhdCI6MTcyODg2OTM5MywianRpIjoiMDk5OTYxNzEtMzU0OC00NjhiLWIxNjUtYTgzZmY1YTc0NzljIiwiZW1haWwiOiJqdXN0aW5sdWkud3VuMmZyZWVAZ21haWwuY29tIn0.P7QpGvgjBW0EW9WsG-ucg9zBiBGUWw3z6pnVt7Q5J3D39HXN8uJNi78K12pvNHIZvC-BF_1tTsYB4gpBNViSvCjxEnSxvsqRQlYQ698lxVVX2N5-l1yaIr-wRXQ83qFqywhylxMeFZWqt4SkMJ3MYu0bF9gPwMsuxeTnAGSdBDV19gCONsCVALU3NZaAADdwgoehFmhGmlxYPuGts6iKkWPA58Zr05zDLgiwu9zrfrZtzORSANtZBXn6uAUAKmSN6l02xq3wV59Kv6rtyM5ujO7nAHNt-XUp4xboQm-RQTfBJeP0ReGuPRWrcN_YJElicd7ItQ3kgRUuTSMtp7cycA"
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

func TestCreateEmployeeInfoFromBearerToken(t *testing.T) {
	bearerToken := "bearer " + expectedIdToken

	employeeInfo, err := New(bearerToken)
	if err != nil {
		t.Error(err)
	}

	if employeeInfo.Id != "w2fnm170018" {
		t.Errorf("Expected employeeId to be w2fnm170018, got %s", employeeInfo.Id)
	}

	if employeeInfo.Email != "justinlui.wun2free@gmail.com" {
		t.Errorf("Expected employeeId to be justinlui.wun2free@gmail.com, got %s", employeeInfo.Email)
	}

	if employeeInfo.Group != "managers" {
		t.Errorf("Expected group to be 'manager', got %s", employeeInfo.Group)
	}
}
