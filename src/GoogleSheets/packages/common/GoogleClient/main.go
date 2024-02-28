package GoogleClient

import (
	"context"
	"fmt"
	"os"

	"google.golang.org/api/sheets/v4"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
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

	scheduleSheetId           = "13opuSCYugK7dKPF6iMl8iy1u2grKO_v7HHesHONN20w"
	scheduleRangeTemplate     = "%s!%s2:%s200"
	scheduleUpcomingSheetName = "Main Schedule SORT BY DESC DATE"
	scheduleSheetName         = "Main Schedule"
	scheduleEmployeeIdCol     = "C"
	scheduleTitleCol          = "E"
	scheduleDataColStart      = "G"
	scheduleDataColEnd        = "J"
)

type SheetsService struct{}

var (
	sheetsService *sheets.Service

	scheduleUpcomingEmployeeIds = fmt.Sprintf(scheduleRangeTemplate, scheduleUpcomingSheetName,
		scheduleEmployeeIdCol,
		scheduleEmployeeIdCol)
	scheduleUpcomingShiftNames = fmt.Sprintf(scheduleRangeTemplate, scheduleUpcomingSheetName,
		scheduleTitleCol,
		scheduleTitleCol)
	scheduleUpcomingData = fmt.Sprintf(scheduleRangeTemplate, scheduleUpcomingSheetName,
		scheduleDataColStart,
		scheduleDataColEnd)

	scheduleEmployeeIds = fmt.Sprintf(scheduleRangeTemplate, scheduleSheetName,
		scheduleEmployeeIdCol,
		scheduleEmployeeIdCol)
	scheduleShiftNames = fmt.Sprintf(scheduleRangeTemplate, scheduleSheetName,
		scheduleTitleCol,
		scheduleTitleCol)
	scheduleData = fmt.Sprintf(scheduleRangeTemplate, scheduleSheetName,
		scheduleDataColStart,
		scheduleDataColEnd)
)

func New() (*SheetsService, error) {
	err := ConnectSheetsServiceIfNecessary()
	return &SheetsService{}, err
}

type GetAvailabilityResponse struct {
	EmployeeIds    [][]interface{}
	Availabilities [][]interface{}
	Dates          []interface{}
	CanUpdate      bool
}

func (s *SheetsService) GetAvailability() (*GetAvailabilityResponse, error) {
	r1, err := sheetsService.Spreadsheets.Values.
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
		return &GetAvailabilityResponse{}, err
	}

	dates := r1.ValueRanges[1].Values[0]
	if len(dates) == 3 {
		dates = append(dates, "")
	}

	return &GetAvailabilityResponse{
		EmployeeIds:    r1.ValueRanges[3].Values,
		Availabilities: r1.ValueRanges[0].Values,
		Dates:          dates,
		CanUpdate:      r1.ValueRanges[2].Values[0][0] == "FALSE",
	}, nil
}

func (s *SheetsService) UpdateAvailability(row int, newAvailability *sheets.ValueRange) error {
	r := row + availabilityUpdateOffset
	updateRange := fmt.Sprintf("%s!%s%d:%s%d", availabilitySheetName, availabilityDay1Col, r, availabilityDay4Col, r)

	_, err := sheetsService.Spreadsheets.Values.
		Update(availabilitySheetId, updateRange, newAvailability).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		return err
	}

	return nil
}

type GetScheduleResponse struct {
	EmployeeIds [][]interface{}
	ShiftNames  [][]interface{}
	Shifts      [][]interface{}
}

func (s *SheetsService) GetUpcomingSchedule() (*GetScheduleResponse, error) {
	response, err := sheetsService.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(
			scheduleUpcomingEmployeeIds,
			scheduleUpcomingShiftNames,
			scheduleUpcomingData,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &GetScheduleResponse{}, err
	}

	return &GetScheduleResponse{
		EmployeeIds: response.ValueRanges[0].Values,
		ShiftNames:  response.ValueRanges[1].Values,
		Shifts:      response.ValueRanges[2].Values,
	}, nil
}

func (s *SheetsService) GetSchedule() (*GetScheduleResponse, error) {
	response, err := sheetsService.Spreadsheets.Values.
		BatchGet(scheduleSheetId).
		Ranges(
			scheduleEmployeeIds,
			scheduleShiftNames,
			scheduleData,
		).
		MajorDimension("ROWS").
		Do()
	if err != nil {
		return &GetScheduleResponse{}, err
	}

	return &GetScheduleResponse{
		EmployeeIds: response.ValueRanges[0].Values,
		ShiftNames:  response.ValueRanges[1].Values,
		Shifts:      response.ValueRanges[2].Values,
	}, nil
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
