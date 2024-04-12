package GetEmployeeId

import (
	"GoogleSheets/packages/common/Constants/AuthConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"errors"
	"fmt"
	"log"
	"strings"
)

func HandleRequest(email string) (string, error) {
	staffListInfo, err := getStaffListInfo()
	if err != nil {
		return "", err
	}

	if len(staffListInfo.Emails) != len(staffListInfo.EmployeeIds) {
		return "", errors.New(AuthConstants.STAFF_LIST_INFO_INCONSISTENT_ERROR)
	}

	employeeId, err := getEmployeeId(email, staffListInfo)
	if err != nil {
		return "", err
	}

	return employeeId, nil
}

func getStaffListInfo() (AuthConstants.STAFF_LIST_INFO, error) {
	sheetsService := GoogleClient.GetSheetsService()

	sheetId := AuthConstants.STAFF_LIST_SHEET_ID

	readRange := fmt.Sprintf("%s!%s", AuthConstants.STAFF_LIST_SHEET_NAME, AuthConstants.EMAIL_GET_RANGE)
	emails, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).MajorDimension("COLUMNS").Do()
	if err != nil {
		return *AuthConstants.DEFAULT_STAFF_LIST_INFO, err
	}
	log.Printf("[INFO] Emails found: %v", emails.Values)

	readRange = fmt.Sprintf("%s!%s", AuthConstants.STAFF_LIST_SHEET_NAME, AuthConstants.EMPLOYEE_ID_GET_RANGE)
	employeeIds, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).MajorDimension("COLUMNS").Do()
	if err != nil {
		return *AuthConstants.DEFAULT_STAFF_LIST_INFO, err
	}
	log.Printf("[INFO] EmployeeIDs found: %v", employeeIds.Values)

	return AuthConstants.STAFF_LIST_INFO{
		Emails:      emails.Values[0],
		EmployeeIds: employeeIds.Values[0],
	}, nil
}

func getEmployeeId(email string, staffListInfo AuthConstants.STAFF_LIST_INFO) (string, error) {
	for i, staffEmail := range staffListInfo.Emails {
		if strings.EqualFold(email, strings.TrimSpace(staffEmail.(string))) {
			log.Printf("[INFO] EmployeeID found for %s: %s", email, staffListInfo.EmployeeIds[i].(string))
			return staffListInfo.EmployeeIds[i].(string), nil
		}
	}

	log.Printf("[INFO] No employeeId found for %s", email)
	return "", SharedConstants.ErrEmployeeNotFound
}
