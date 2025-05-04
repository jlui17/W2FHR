package Availability

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/TimeUtil"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"errors"
	"fmt"
	"log"
	"sort"
	"time"

	"google.golang.org/api/sheets/v4"
)

const (
	availabilitySheetId   string = "1aD4gOklV79zj6ctsOH8N6mUB0cE-Nz5F_ZCh1Mww8zI"
	availabilitySheetName string = "Availability"
	availabilityDay1Col   string = "E"
	availabilityDay4Col   string = "H"
)

var (
	availabilityCanUpdateCell = fmt.Sprintf("'%s'!J3", availabilitySheetName)
	availabilityDates         = fmt.Sprintf("'%s'!E2:H2", availabilitySheetName)
	availabilityEmployeeIds   = fmt.Sprintf("'%s'!A3:A", availabilitySheetName)
	availabilityData          = fmt.Sprintf("'%s'!D3:H", availabilitySheetName)
	availabilityPositionsCol  = fmt.Sprintf("'%s'!C3:C", availabilitySheetName)
	availabilityShowMonday    = fmt.Sprintf("'%s'!I3", availabilitySheetName)
	availabilityStartOfWeek   = fmt.Sprintf("'%s'!E2", availabilitySheetName)

	ErrUpdateAvailabilityDisabled = errors.New("Updating availability is currently disabled.")
)

type EmployeeAvailabilityDay struct {
	IsAvailable bool   `json:"isAvailable"`
	Date        string `json:"date"`
}

type EmployeeAvailability struct {
	Day1       EmployeeAvailabilityDay `json:"day1"`
	Day2       EmployeeAvailabilityDay `json:"day2"`
	Day3       EmployeeAvailabilityDay `json:"day3"`
	Day4       EmployeeAvailabilityDay `json:"day4"`
	CanUpdate  bool                    `json:"canUpdate"`
	ShowMonday bool                    `json:"showMonday"`
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
			availabilityRange(info.AvailabilityRow),
			availabilityDates,
			availabilityCanUpdateCell,
			availabilityShowMonday,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &EmployeeAvailability{}, err
	}

	daysAvailable := res.ValueRanges[0].Values[0]
	dates := res.ValueRanges[1].Values[0]
	canUpdate := res.ValueRanges[2].Values[0][0]
	showMonday := res.ValueRanges[3].Values[0][0].(string) == "TRUE"

	return createAvailability(daysAvailable, dates, canUpdate, showMonday), nil
}

func (a *availabilitySheet) GetIds() (*[]interface{}, error) {
	res, err := a.service.Spreadsheets.Values.Get(
		availabilitySheetId,
		availabilityEmployeeIds,
	).
		MajorDimension("COLUMNS").
		Do()
	if err != nil {
		return &[]interface{}{}, err
	}

	return &res.Values[0], nil
}

func createAvailability(daysAvailable []interface{}, dates []interface{}, canUpdate interface{}, showMonday bool) *EmployeeAvailability {
	day1 := daysAvailable[0] == "TRUE"
	day2 := daysAvailable[1] == "TRUE"
	day3 := daysAvailable[2] == "TRUE"
	day4 := daysAvailable[3] == "TRUE"

	return &EmployeeAvailability{
		Day1:       EmployeeAvailabilityDay{IsAvailable: day1, Date: dates[0].(string)},
		Day2:       EmployeeAvailabilityDay{IsAvailable: day2, Date: dates[1].(string)},
		Day3:       EmployeeAvailabilityDay{IsAvailable: day3, Date: dates[2].(string)},
		Day4:       EmployeeAvailabilityDay{IsAvailable: day4, Date: dates[3].(string)},
		CanUpdate:  canUpdate == "FALSE",
		ShowMonday: showMonday,
	}
}

func (a *availabilitySheet) Update(employee EmployeeInfo.EmployeeInfo, newAvailability *EmployeeAvailability) error {
	canUpdate, err := a.CanUpdateAvailability()
	if err != nil {
		return err
	}

	if !canUpdate {
		return ErrUpdateAvailabilityDisabled
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

	_, err = a.service.Spreadsheets.Values.Update(
		availabilitySheetId,
		availabilityRange(employee.AvailabilityRow),
		updateValueRange,
	).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		return err
	}

	return nil
}

func availabilityRange(row int) string {
	return fmt.Sprintf("%s!%s%d:%s%d", availabilitySheetName, availabilityDay1Col, row, availabilityDay4Col, row)
}

func (a *availabilitySheet) CanUpdateAvailability() (bool, error) {
	res, err := a.service.Spreadsheets.Values.Get(
		availabilitySheetId,
		availabilityCanUpdateCell,
	).Do()
	if err != nil {
		return false, err
	}

	return res.Values[0][0] == "FALSE", nil
}

func (a *availabilitySheet) GetAvailabilityForTheWeek() (AvailabilityForTheWeek, error) {
	res, err := a.service.Spreadsheets.Values.BatchGet(availabilitySheetId).
		Ranges(
			availabilityDates,
			availabilityData,
			availabilityPositionsCol,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return AvailabilityForTheWeek{}, err
	}

	dates := SharedConstants.DToStrArr(res.ValueRanges[0].Values[0])
	log.Printf("[DEBUG] Dates from google sheets: %v", dates)
	employeeNamesAndAvailability := SharedConstants.DDToStrArr(res.ValueRanges[1].Values)
	log.Printf("[DEBUG] Availability data from google sheets: %v", employeeNamesAndAvailability)
	positions := SharedConstants.DToStrArr(SharedConstants.Flatten(res.ValueRanges[2].Values))
	log.Printf("[DEBUG] Positions from google sheets: %v", positions)

	return createAvailabilityForTheWeek(
		dates,
		getEmployeesAvailablePerDay(employeeNamesAndAvailability, positions)), nil
}

func createAvailabilityForTheWeek(dates []string, employeesAvailablePerDay *[]AvailabileEmployees) AvailabilityForTheWeek {
	res := AvailabilityForTheWeek{}
	for i := range dates {
		sort.Sort((*employeesAvailablePerDay)[i])
		res[dates[i]] = (*employeesAvailablePerDay)[i]
	}

	return res
}

func getEmployeesAvailablePerDay(availability [][]string, positions []string) *[]AvailabileEmployees {
	var res = make([]AvailabileEmployees, 4)

	for row := range availability {
		for day := 1; day < 5; day++ {
			if availability[row][day] == "TRUE" {
				employeeName := availability[row][0]
				position := positions[row]
				res[day-1] = append(res[day-1], AvailabileEmployee{Name: employeeName, Position: position})
			}
		}
	}

	return &res
}

func (a *availabilitySheet) GetStartOfWeek() (time.Time, error) {
	res, err := a.service.Spreadsheets.Values.Get(
		availabilitySheetId,
		availabilityStartOfWeek,
	).Do()
	if err != nil {
		log.Printf("[ERROR] Google Sheets - Failed to get StartOfWeek: %v", err)
		return time.Time{}, err
	}

	return TimeUtil.ConvertDateToTime(res.Values[0][0].(string), TimeUtil.ScheduleDateFormat), nil
}

func (a *availabilitySheet) UpdateStartOfWeek(date time.Time) error {
	updateValueRange := &sheets.ValueRange{
		Values: [][]interface{}{
			{
				date.Format(TimeUtil.ScheduleDateFormat),
			},
		},
	}

	_, err := a.service.Spreadsheets.Values.Update(
		availabilitySheetId,
		availabilityStartOfWeek,
		updateValueRange,
	).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		log.Printf("[ERROR] Google Sheets - Failed to update StartOfWeek: %v", err)
		return err
	}

	return nil
}

func (a *availabilitySheet) GetShowMonday() (bool, error) {
	res, err := a.service.Spreadsheets.Values.Get(
		availabilitySheetId,
		availabilityShowMonday,
	).Do()
	if err != nil {
		log.Printf("[ERROR] Google Sheets - Failed to get ShowMonday: %v", err)
		return false, err
	}

	return res.Values[0][0] == "TRUE", nil
}

func (a *availabilitySheet) UpdateShowMonday(showMonday bool) error {
	updateValueRange := &sheets.ValueRange{
		Values: [][]interface{}{
			{
				showMonday,
			},
		},
	}

	_, err := a.service.Spreadsheets.Values.Update(
		availabilitySheetId,
		availabilityShowMonday,
		updateValueRange,
	).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		log.Printf("[ERROR] Google Sheets - Failed to update ShowMonday: %v", err)
		return err
	}

	return nil
}

func (a *availabilitySheet) UpdateCanUpdate(canUpdate bool) error {
	updateValueRange := &sheets.ValueRange{
		Values: [][]interface{}{
			{
				canUpdate,
			},
		},
	}

	_, err := a.service.Spreadsheets.Values.Update(
		availabilitySheetId,
		availabilityCanUpdateCell,
		updateValueRange,
	).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		log.Printf("[ERROR] Google Sheets - Failed to update DisableUpdates: %v", err)
		return err
	}

	return nil
}
