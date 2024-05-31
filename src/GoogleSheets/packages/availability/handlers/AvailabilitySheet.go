package Availability

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"fmt"

	"google.golang.org/api/sheets/v4"
)

const (
	availabilitySheetId       = "1m-t041RzaQRj2XqGo0KIpAnzUg6w71e0_9UFudIJnxU"
	availabilitySheetName     = "Availability"
	availabilityViewName      = "View"
	availabilityDay1Col       = "E"
	availabilityDay4Col       = "H"
	availabilityCanUpdateCell = availabilityViewName + "!G4"
	availabilityViewingDates  = availabilityViewName + "!B4:E4"
	availabilityEmployeeIds   = availabilitySheetName + "!A2:A"
	availabilityCells         = availabilitySheetName + "!E2:H"
	availabilityUpdateOffset  = 2

	UPDATE_AVAILABILITY_DISABLED_ERROR = "UPDATE_AVAILABILITY_DISABLED_ERROR"
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

func getAvailabilitySheet() (*availabilitySheet, error) {
	service, err := GoogleClient.New()
	if err != nil {
		return &availabilitySheet{}, err
	}

	return &availabilitySheet{service: service}, nil
}

func (a *availabilitySheet) Get(employeeId string) (*EmployeeAvailability, error) {
	all, err := a.getAll()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	r, err := findRowOfEmployee(all.EmployeeIds, employeeId)
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	day1 := all.Availabilities[r][0] == "TRUE"
	day2 := all.Availabilities[r][1] == "TRUE"
	day3 := all.Availabilities[r][2] == "TRUE"
	day4 := all.Availabilities[r][3] == "TRUE"

	return &EmployeeAvailability{
		Day1:      EmployeeAvailabilityDay{IsAvailable: day1, Date: all.Dates[0].(string)},
		Day2:      EmployeeAvailabilityDay{IsAvailable: day2, Date: all.Dates[1].(string)},
		Day3:      EmployeeAvailabilityDay{IsAvailable: day3, Date: all.Dates[2].(string)},
		Day4:      EmployeeAvailabilityDay{IsAvailable: day4, Date: all.Dates[3].(string)},
		CanUpdate: all.CanUpdate,
	}, nil
}

func (a *availabilitySheet) getAll() (*AllAvailability, error) {
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
	if len(dates) == 3 {
		dates = append(dates, "")
	}

	return &AllAvailability{
		EmployeeIds:    r1.ValueRanges[3].Values,
		Availabilities: r1.ValueRanges[0].Values,
		Dates:          dates,
		CanUpdate:      r1.ValueRanges[2].Values[0][0] == "FALSE",
	}, nil
}

func (a *availabilitySheet) Update(employeeId string, newAvailability *EmployeeAvailability) error {
	all, err := a.getAll()
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
