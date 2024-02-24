package GoogleClient

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"context"
	"errors"
	"fmt"
	"os"

	"google.golang.org/api/sheets/v4"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

const (
	availabilitySheetId       = "13LQSitRMmmyZPwvvDa5Pbf9yMWzKL2y0TaitaETqCmI"
	availabilitySheetName     = "Availability"
	availabilityViewName      = "View"
	day1Col                   = "E"
	day4Col                   = "H"
	availabilityCanUpdateCell = availabilityViewName + "!G4"
	availabilityViewingDates  = availabilityViewName + "!B4:E4"
)

type GoogleSheetsService interface {
	GetAvailability() ([][]interface{}, error)
	CanUpdateAvailability() (bool, error)
	UpdateAvailabilityOnRow(row string, newAvailability *AvailabilityConstants.EmployeeAvailability) (*AvailabilityConstants.EmployeeAvailability, error)
	GetSchedule() ([][]interface{}, error)
	UpdateAvailability(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) (bool, error)
}

type SheetsService struct{}

var (
	sheetsService *sheets.Service
)

func New() (*SheetsService, error) {
	err := ConnectSheetsServiceIfNecessary()
	return &SheetsService{}, err
}

type GetAvailabilityResponse struct {
	EmployeeIds    []interface{}
	Availabilities [][]interface{}
	Dates          []interface{}
	CanUpdate      bool
}

func (s *SheetsService) GetAvailability() (*GetAvailabilityResponse, error) {
	r1, err := sheetsService.Spreadsheets.Values.
		BatchGet(availabilitySheetId).
		Ranges(
			fmt.Sprintf("%s!E2:H", availabilitySheetName),
			"View!B4:E4",
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &GetAvailabilityResponse{}, err
	}

	r2, err := sheetsService.Spreadsheets.Values.
		Get(availabilitySheetId, fmt.Sprintf("%s!A2:A", availabilitySheetName)).
		MajorDimension("COLUMNS").
		Do()
	if err != nil {
		return &GetAvailabilityResponse{}, err
	}

	dates := r1.ValueRanges[1].Values[0]
	if len(dates) == 3 {
		dates = append(dates, "")
	}

	canUpdate, err := s.canUpdateAvailability()
	if err != nil {
		return &GetAvailabilityResponse{}, err
	}

	return &GetAvailabilityResponse{
		EmployeeIds:    r2.Values[0],
		Availabilities: r1.ValueRanges[0].Values,
		Dates:          dates,
		CanUpdate:      canUpdate,
	}, nil
}

func (s *SheetsService) canUpdateAvailability() (bool, error) {
	response, err := sheetsService.Spreadsheets.Values.
		Get(availabilitySheetId, availabilityCanUpdateCell).
		Do()
	if err != nil {
		return false, err
	}

	return response.Values[0][0] == "FALSE", nil
}

func (s *SheetsService) UpdateAvailability(employeeId string, newEmployeeAvailability *AvailabilityConstants.EmployeeAvailability) error {
	availability, err := s.GetAvailability()
	if err != nil {
		return err
	}

	if !availability.CanUpdate {
		return errors.New(AvailabilityConstants.UPDATE_AVAILABILITY_DISABLED_ERROR)
	}

	r := -1
	for i, id := range availability.EmployeeIds {
		if id == employeeId {
			r = i
			break
		}
	}
	if r == -1 {
		return errors.New(SharedConstants.EMPLOYEE_NOT_FOUND_ERROR)
	}

	err = s.updateAvailabilityOnRow(r, newEmployeeAvailability)
	if err != nil {
		return err
	}

	return nil
}

func (s *SheetsService) updateAvailabilityOnRow(row int, newAvailability *AvailabilityConstants.EmployeeAvailability) error {
	r := row + 2
	updateRange := fmt.Sprintf("%s!%s%d:%s%d", availabilitySheetName, day1Col, r, day4Col, r)
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

	_, err := sheetsService.Spreadsheets.Values.
		Update(availabilitySheetId, updateRange, updateValueRange).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		return err
	}

	return nil
}

func (s *SheetsService) GetSchedule() ([][]interface{}, error) {
	sheetId := TimesheetConstants.TIMESHEET_SHEET_ID
	readRange := fmt.Sprintf("%s!%s", TimesheetConstants.SCHEDULE_SHEET_NAME, TimesheetConstants.SCHEDULE_GET_RANGE)

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return [][]interface{}{}, err
	}

	return response.Values, nil
}

func GetSheetsService() *sheets.Service {
	return sheetsService
}

func ConnectSheetsServiceIfNecessary() error {
	if sheetsService != nil {
		return nil
	}

	token, err := google.JWTConfigFromJSON([]byte(os.Getenv("G_SERVICE_CONFIG_JSON")), "https://www.googleapis.com/auth/spreadsheets")
	if err != nil {
		return err
	}

	client := token.Client(context.Background())
	service, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return err
	}

	sheetsService = service
	return nil
}
