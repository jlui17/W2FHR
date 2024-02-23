package GoogleClient

import (
	"GoogleSheets/packages/common/Constants/AvailabilityConstants"
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"context"
	"fmt"
	"os"

	"google.golang.org/api/sheets/v4"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

const (
	READ_ONLY_SCOPE  = "https://www.googleapis.com/auth/spreadsheets.readonly"
	READ_WRITE_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
)

type GoogleSheetsService interface {
	GetAvailability() ([][]interface{}, error)
	CanUpdateAvailability() (bool, error)
	UpdateAvailabilityOnRow(row string, newAvailability *AvailabilityConstants.EmployeeAvailability) (*AvailabilityConstants.EmployeeAvailability, error)
	GetDatesForAvailability() ([]string, error)
	GetSchedule() ([][]interface{}, error)
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
	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID

	r1, err := sheetsService.Spreadsheets.Values.BatchGet(sheetId).
		Ranges(
			"Availability!E2:H",
			"View!B4:E4",
			"View!G4",
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &GetAvailabilityResponse{}, err
	}

	r2, err := sheetsService.Spreadsheets.Values.
		Get(sheetId, "Availability!A2:A").
		MajorDimension("COLUMNS").
		Do()
	if err != nil {
		return &GetAvailabilityResponse{}, err
	}

	dates := r1.ValueRanges[1].Values[0]
	if len(dates) == 3 {
		dates = append(dates, "")
	}

	return &GetAvailabilityResponse{
		EmployeeIds:    r2.Values[0],
		Availabilities: r1.ValueRanges[0].Values,
		Dates:          dates,
		CanUpdate:      r1.ValueRanges[2].Values[0][0].(string) == "TRUE",
	}, nil
}

func (s *SheetsService) CanUpdateAvailability() (bool, error) {
	sheetId := AvailabilityConstants.AVAILABILITY_SHEET_ID
	readRange := AvailabilityConstants.AVAILABILITY_CAN_UPDATE_CELL

	response, err := sheetsService.Spreadsheets.Values.Get(sheetId, readRange).Do()
	if err != nil {
		return false, err
	}

	if response.Values[0][0].(string) == "TRUE" {
		return false, nil
	}

	return true, nil
}

func (s *SheetsService) UpdateAvailabilityOnRow(row int, newAvailability *AvailabilityConstants.EmployeeAvailability) (*AvailabilityConstants.EmployeeAvailability, error) {
	updateRange := AvailabilityConstants.GetUpdateAvailabilityRangeFromRow(row)
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
	updateResponse, err := sheetsService.Spreadsheets.Values.Update(AvailabilityConstants.AVAILABILITY_SHEET_ID, updateRange, updateValueRange).ValueInputOption("RAW").IncludeValuesInResponse(true).Do()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	dates, err := getDatesForAvailability()
	if err != nil {
		return &AvailabilityConstants.DEFAULT_EMPLOYEE_AVAILABILITY, err
	}

	isAvailableDay1 := updateResponse.UpdatedData.Values[0][0] == "TRUE"
	isAvailableDay2 := updateResponse.UpdatedData.Values[0][1] == "TRUE"
	isAvailableDay3 := updateResponse.UpdatedData.Values[0][2] == "TRUE"
	isAvailableDay4 := updateResponse.UpdatedData.Values[0][3] == "TRUE"

	return &AvailabilityConstants.EmployeeAvailability{
		Day1:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay1, Date: dates[0]},
		Day2:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay2, Date: dates[1]},
		Day3:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay3, Date: dates[2]},
		Day4:      AvailabilityConstants.EmployeeAvailabilityDay{IsAvailable: isAvailableDay4, Date: dates[3]},
		CanUpdate: true,
	}, nil
}

func (s *SheetsService) GetDatesForAvailability() ([]string, error) {
	return getDatesForAvailability()
}

func getDatesForAvailability() ([]string, error) {
	unformattedDates, err := sheetsService.Spreadsheets.Values.Get(AvailabilityConstants.AVAILABILITY_SHEET_ID, AvailabilityConstants.AVAILABILITY_VIEWING_DATES_READ_RANGE).Do()
	if err != nil {
		return nil, err
	}

	dates := formatDates(unformattedDates.Values)
	return dates, nil
}

func formatDates(unformattedDates [][]interface{}) []string {
	dates := []string{}

	for i := 0; i < len(unformattedDates[0]); i++ {
		dates = append(dates, fmt.Sprint(unformattedDates[0][i]))
	}

	if len(dates) == 3 {
		dates = append(dates, "")
	}

	return dates
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
