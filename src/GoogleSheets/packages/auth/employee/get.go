package Authorization

import (
	Availability "GoogleSheets/packages/availability/handlers"
	SharedConstants "GoogleSheets/packages/common/Constants"
	"GoogleSheets/packages/common/GoogleClient"
	"errors"
	"log"
	"os"
	"strings"
)

const (
	sheetId                    = "1kwvcsbcyHA5x__RoXzo1a-4b1zURwwCUuahCgNUtAJ8"
	getRangePrefix             = "'Total Staff'!"
	emailGetRange              = getRangePrefix + "G2:G"
	idGetRange                 = getRangePrefix + "A2:A"
	positionsGetRange          = getRangePrefix + "J2:J"
	availabilitySheetRowOffset = 3
)

var (
	cognitoSupervisorsGroupKey = "COGNITO_SUPERVISORS_GROUP_NAME"
	cognitoManagersGroupKey    = "COGNITO_MANAGERS_GROUP_NAME"
)

type EmployeeInfoForSignUp struct {
	Id                   string
	Group                string
	AvailabilitySheetRow int
}

type staffListInfo struct {
	Emails    []interface{}
	Ids       []interface{}
	Positions []interface{}
}

func getEmployeeInfoForSignUp(email string) (*EmployeeInfoForSignUp, error) {
	staffListInfo, err := getStaffListInfo()
	if err != nil {
		log.Printf("[ERROR] Auth - error while getting staff list info: %s", err)
		return &EmployeeInfoForSignUp{}, err
	}

	if len(staffListInfo.Emails) != len(staffListInfo.Ids) || len(staffListInfo.Emails) != len(staffListInfo.Positions) {
		log.Printf(
			"[ERROR] Auth - # of emails (%d) != # of ids (%d) or positions (%d)",
			len(staffListInfo.Emails),
			len(staffListInfo.Ids),
			len(staffListInfo.Positions),
		)
		return &EmployeeInfoForSignUp{}, errors.New("number of emails is not the same as # of ids or positions")
	}

	availabilitySheetEmployeeIds, err := getAvailabilitySheetEmployeeIds()
	if err != nil {
		return &EmployeeInfoForSignUp{}, err
	}

	res, err := doGetInfo(email, staffListInfo, availabilitySheetEmployeeIds)
	if err != nil {
		return &EmployeeInfoForSignUp{}, err
	}

	return res, nil
}

func getStaffListInfo() (*staffListInfo, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		return &staffListInfo{}, err
	}

	res, err := sheetsService.Spreadsheets.Values.
		BatchGet(sheetId).
		Ranges(
			emailGetRange,
			idGetRange,
			positionsGetRange,
		).
		MajorDimension("COLUMNS").
		Do()
	if err != nil {
		return &staffListInfo{}, err
	}

	emails := res.ValueRanges[0].Values[0]
	ids := res.ValueRanges[1].Values[0]
	positions := res.ValueRanges[2].Values[0]
	log.Printf("[INFO] Auth - Found staff list info!\nEmails: %v\nIds: %v\nPositions: %v", emails, ids, positions)

	return &staffListInfo{
		Emails:    emails,
		Ids:       ids,
		Positions: positions,
	}, nil
}

func getAvailabilitySheetEmployeeIds() (*[]interface{}, error) {
	availabilitySheet, err := Availability.Connect()
	if err != nil {
		return &[]interface{}{}, err
	}

	ids, err := availabilitySheet.GetIds()
	if err != nil {
		return &[]interface{}{}, err
	}

	return ids, err
}

func doGetInfo(email string, staffListInfo *staffListInfo, availabilitySheetEmployeeIds *[]interface{}) (*EmployeeInfoForSignUp, error) {
	var id string
	var group string
	for i, staffEmail := range staffListInfo.Emails {
		if strings.EqualFold(email, strings.TrimSpace(staffEmail.(string))) {
			group = translateToCognitoGroup(staffListInfo.Positions[i].(string))
			id = staffListInfo.Ids[i].(string)
		}
	}

	if id == "" || group == "" {
		log.Printf("[DEBUG] No employeeId found for %s\nStaff List Emails: %v", email, staffListInfo.Emails)
		return &EmployeeInfoForSignUp{}, SharedConstants.ErrEmployeeNotFound
	}

	availabilitySheetRow := -1
	for i, sheetId := range *availabilitySheetEmployeeIds {
		if sheetId.(string) == id {
			availabilitySheetRow = i + availabilitySheetRowOffset
		}
	}

	if availabilitySheetRow == -1 {
		log.Printf("[DEBUG] Couldn't find row of employee %s in availability sheet: %v", id, availabilitySheetEmployeeIds)
		return &EmployeeInfoForSignUp{}, SharedConstants.ErrEmployeeNotFound
	}

	log.Printf("[INFO] Employee Info found for %s: %s", email, id)
	return &EmployeeInfoForSignUp{
		Id:                   id,
		Group:                group,
		AvailabilitySheetRow: availabilitySheetRow,
	}, nil
}

func translateToCognitoGroup(position string) string {
	group := os.Getenv(SharedConstants.COGNITO_ATTENDANTS_GROUP_ENV_KEY)
	if strings.Contains(strings.ToLower(position), "supervisor") {
		group = os.Getenv(cognitoSupervisorsGroupKey)
	} else if strings.Contains(strings.ToLower(position), "manager") {
		group = os.Getenv(cognitoManagersGroupKey)
	}

	return group
}
