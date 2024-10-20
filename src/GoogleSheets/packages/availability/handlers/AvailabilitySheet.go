package Availability

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"GoogleSheets/packages/common/GoogleClient"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"fmt"

	"google.golang.org/api/sheets/v4"
)

const (
	availabilitySheetId      string = "13opuSCYugK7dKPF6iMl8iy1u2grKO_v7HHesHONN20w"
	availabilitySheetName    string = "Availability"
	availabilityViewName     string = "View - Availability"
	availabilityDay1Col      string = "E"
	availabilityDay4Col      string = "H"
	availabilityUpdateOffset int    = 3

	UPDATE_AVAILABILITY_DISABLED_ERROR string = "UPDATE_AVAILABILITY_DISABLED_ERROR"
)

var (
	availabilityCanUpdateCell = fmt.Sprintf("'%s'!G4", availabilityViewName)
	availabilityViewingDates  = fmt.Sprintf("'%s'!B4:E4", availabilityViewName)
	availabilityEmployeeIds   = fmt.Sprintf("'%s'!A3:A", availabilitySheetName)
	availabilityCells         = fmt.Sprintf("'%s'!%s3:%s", availabilitySheetName, availabilityDay1Col, availabilityDay4Col)
)

type EmployeeAvailabilityDay struct {
	IsAvailable bool   `json:"isAvailable"`
	Date        string `json:"date"`
}

type EmployeeAvailability struct {
	Day1      EmployeeAvailabilityDay `json:"day1"`
	Day2      EmployeeAvailabilityDay `json:"day2"`
	Day3      EmployeeAvailabilityDay `json:"day3"`
	Day4      EmployeeAvailabilityDay `json:"day4"`
	CanUpdate bool                    `json:"canUpdate"`
}

type AllAvailability struct {
	EmployeeIds    [][]interface{}
	Availabilities [][]interface{}
	Dates          []interface{}
	CanUpdate      bool
}

type availabilitySheet struct {
	service *sheets.Service
}

func Connect() (*availabilitySheet, error) {
	service, err := GoogleClient.New()
	if err != nil {
		return &availabilitySheet{}, err
	}

	return &availabilitySheet{service: service}, nil
}

func (a *availabilitySheet) Get(info EmployeeInfo.EmployeeInfo) (*EmployeeAvailability, error) {
	res, err := a.service.Spreadsheets.Values.BatchGet(availabilitySheetId).
		Ranges(
			availabilityGetRange(info.AvailabilityRow),
			availabilityViewingDates,
			availabilityCanUpdateCell,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	daysAvailable := res.ValueRanges[0].Values[0]
	dates := res.ValueRanges[1].Values[0]
	canUpdate := res.ValueRanges[2].Values[0][0]

	return createAvailability(daysAvailable, dates, canUpdate), nil
}

func availabilityGetRange(row int) string {
	return fmt.Sprintf("%s!%s%d:%s%d", availabilitySheetName, availabilityDay1Col, row, availabilityDay4Col, row)
}

func (a *availabilitySheet) GetAll() (*AllAvailability, error) {
	r1, err := a.service.Spreadsheets.Values.
		BatchGet(availabilitySheetId).
		Ranges(
			availabilityCells,
			availabilityViewingDates,
			availabilityCanUpdateCell,
			availabilityEmployeeIds,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &AllAvailability{}, err
	}

	dates := r1.ValueRanges[1].Values[0]
	transformDatesIfNecessary(&dates)

	return &AllAvailability{
		EmployeeIds:    r1.ValueRanges[3].Values,
		Availabilities: r1.ValueRanges[0].Values,
		Dates:          dates,
		CanUpdate:      r1.ValueRanges[2].Values[0][0] == "FALSE",
	}, nil
}

func createAvailability(daysAvailable []interface{}, dates []interface{}, canUpdate interface{}) *EmployeeAvailability {
	day1 := daysAvailable[0] == "TRUE"
	day2 := daysAvailable[1] == "TRUE"
	day3 := daysAvailable[2] == "TRUE"
	day4 := daysAvailable[3] == "TRUE"

	transformDatesIfNecessary(&dates)

	return &EmployeeAvailability{
		Day1:      EmployeeAvailabilityDay{IsAvailable: day1, Date: dates[0].(string)},
		Day2:      EmployeeAvailabilityDay{IsAvailable: day2, Date: dates[1].(string)},
		Day3:      EmployeeAvailabilityDay{IsAvailable: day3, Date: dates[2].(string)},
		Day4:      EmployeeAvailabilityDay{IsAvailable: day4, Date: dates[3].(string)},
		CanUpdate: canUpdate == "FALSE",
	}
}

func transformDatesIfNecessary(dates *[]interface{}) {
	if len(*dates) == 3 {
		*dates = append(*dates, "")
	}
}

func (a *availabilitySheet) Update(employeeId string, newAvailability *EmployeeAvailability) error {
	all, err := a.GetAll()
	if err != nil {
		return err
	}

	if !all.CanUpdate {
		return fmt.Errorf(UPDATE_AVAILABILITY_DISABLED_ERROR)
	}

	row, err := findRowOfEmployee(all.EmployeeIds, employeeId)
	if err != nil {
		return err
	}

	updateValueRange := &sheets.ValueRange{
		Values: [][]interface{}{
			{
				newAvailability.Day1.IsAvailable,
				newAvailability.Day2.IsAvailable,
				newAvailability.Day3.IsAvailable,
				newAvailability.Day4.IsAvailable,
			},
		},
	}

	r := row + availabilityUpdateOffset
	updateRange := fmt.Sprintf("%s!%s%d:%s%d", availabilitySheetName, availabilityDay1Col, r, availabilityDay4Col, r)

	_, err = a.service.Spreadsheets.Values.
		Update(availabilitySheetId, updateRange, updateValueRange).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		return err
	}

	return nil
}

func findRowOfEmployee(employeeIds [][]interface{}, employeeId string) (int, error) {
	for i, row := range employeeIds {
		if row[0] == employeeId {
			return i, nil
		}
	}
	return 0, SharedConstants.ErrEmployeeNotFound
}
