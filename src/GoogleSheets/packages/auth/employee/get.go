package Authorization

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"errors"
	"log"
	"os"
	"strings"
)

const (
	sheetId           = "1kwvcsbcyHA5x__RoXzo1a-4b1zURwwCUuahCgNUtAJ8"
	getRangePrefix    = "'Total Staff'!"
	emailGetRange     = getRangePrefix + "G2:G"
	idGetRange        = getRangePrefix + "A2:A"
	positionsGetRange = getRangePrefix + "J2:J"
)

var (
	cognitoAttendantsGroupKey  = "COGNITO_ATTENDANTS_GROUP_NAME"
	cognitoSupervisorsGroupKey = "COGNITO_SUPERVISORS_GROUP_NAME"
	cognitoManagersGroupKey    = "COGNITO_MANAGERS_GROUP_NAME"
)

type EmployeeInfoForSignUp struct {
	Id    string
	Group string
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

	res, err := doGetInfo(email, staffListInfo)
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

func doGetInfo(email string, staffListInfo *staffListInfo) (*EmployeeInfoForSignUp, error) {
	for i, staffEmail := range staffListInfo.Emails {
		if strings.EqualFold(email, strings.TrimSpace(staffEmail.(string))) {
			position := staffListInfo.Positions[i].(string)
			group := translateToCognitoGroup(position)
			id := staffListInfo.Ids[i].(string)

			log.Printf("[INFO] Employee Info found for %s: %s", email, id)
			return &EmployeeInfoForSignUp{
				Id:    id,
				Group: group,
			}, nil
		}
	}

	log.Printf("[INFO] No employeeId found for %s", email)
	return &EmployeeInfoForSignUp{}, SharedConstants.ErrEmployeeNotFound
}

func translateToCognitoGroup(position string) string {
	group := os.Getenv(cognitoAttendantsGroupKey)
	if strings.Contains(strings.ToLower(position), "supervisor") {
		group = os.Getenv(cognitoSupervisorsGroupKey)
	} else if strings.Contains(strings.ToLower(position), "manager") {
		group = os.Getenv(cognitoManagersGroupKey)
	}

	return group
}
