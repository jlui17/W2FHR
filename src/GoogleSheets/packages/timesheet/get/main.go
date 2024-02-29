package GetTimesheet

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/TimeService"
	"log"

	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
)

type Timesheet struct {
	Shifts []EmployeeShift `json:"shifts"`
}

type EmployeeShift struct {
	Date          string `json:"date"`
	ShiftTitle    string `json:"shiftTitle"`
	StartTime     string `json:"startTime"`
	EndTime       string `json:"endTime"`
	BreakDuration string `json:"breakDuration"`
}

func HandleRequest(employeeId string, upcoming bool) (events.APIGatewayProxyResponse, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		log.Printf("[ERROR] Failed to connect to Google API: %s", err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, nil
	}

	var employeeShifts *Timesheet

	switch upcoming {
	case true:
		log.Printf("[INFO] Getting upcoming shifts for employee: %s", employeeId)
		schedule, err := sheetsService.GetUpcomingSchedule()
		if err != nil {
			log.Printf("[ERROR] Failed to retrieve upcoming schedule from google sheets: %s", err.Error())
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			}, nil
		}

		schedule, err = filterForUpcomingShifts(schedule)
		if err != nil {
			log.Printf("[ERROR] Failed to filter for upcoming shifts: %s", err.Error())
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			}, nil
		}

		employeeShifts = getShifts(employeeId, schedule, true)
	case false:
		log.Printf("[INFO] Getting all shifts for employee: %s", employeeId)
		schedule, err := sheetsService.GetSchedule()
		if err != nil {
			log.Printf("[ERROR] Failed to retrieve schedule from google sheets: %s", err.Error())
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			}, err
		}

		employeeShifts = getShifts(employeeId, schedule, false)
	}

	log.Printf("[INFO] Found shifts for %s: %v", employeeId, employeeShifts)
	res, _ := json.Marshal(employeeShifts)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, err
}

func filterForUpcomingShifts(schedule *GoogleClient.GetScheduleResponse) (*GoogleClient.GetScheduleResponse, error) {
	employeeIds := [][]interface{}{}
	shiftNames := [][]interface{}{}
	shifts := [][]interface{}{}

	today := TimeService.GetToday()
	log.Printf("[INFO] Today: %s", today.String())
	for i, row := range schedule.Shifts {
		shiftDate := row[0].(string)
		convertedDate, err := TimeService.ConvertDateToTime(shiftDate)
		if err != nil {
			log.Printf("[ERROR] Failed to convert date: %s\nError: ", shiftDate, err.Error())
			return &GoogleClient.GetScheduleResponse{}, err
		}

		shiftIsUpcoming := convertedDate.After(today) || convertedDate.Equal(today)
		if !shiftIsUpcoming {
			break
		}

		employeeIds = append(employeeIds, schedule.EmployeeIds[i])
		shiftNames = append(shiftNames, schedule.ShiftNames[i])
		shifts = append(shifts, schedule.Shifts[i])
	}

	return &GoogleClient.GetScheduleResponse{
		EmployeeIds: employeeIds,
		ShiftNames:  shiftNames,
		Shifts:      shifts,
	}, nil
}

func getShifts(employeeId string, schedule *GoogleClient.GetScheduleResponse, reverse bool) *Timesheet {
	employeeShifts := []EmployeeShift{}

	for i := 0; i < len(schedule.EmployeeIds); i++ {
		if schedule.EmployeeIds[i][0] == employeeId {
			employeeShifts = append(employeeShifts, EmployeeShift{
				ShiftTitle:    schedule.ShiftNames[i][0].(string),
				Date:          schedule.Shifts[i][0].(string),
				StartTime:     schedule.Shifts[i][1].(string),
				EndTime:       schedule.Shifts[i][2].(string),
				BreakDuration: schedule.Shifts[i][3].(string),
			})
		}
	}

	// upcoming shifts sorted in desc date, need to return in asc date order
	if reverse {
		for i, j := 0, len(employeeShifts)-1; i < j; i, j = i+1, j-1 {
			employeeShifts[i], employeeShifts[j] = employeeShifts[j], employeeShifts[i]
		}
	}

	return &Timesheet{
		Shifts: employeeShifts,
	}
}
