package GetTimesheet

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/TimeService"
	"GoogleSheets/packages/common/Utilities/SharedUtil"
	"GoogleSheets/packages/timesheet/TimesheetProcessor"
	"log"

	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
)

func HandleRequest(employeeId string, upcoming bool) (events.APIGatewayProxyResponse, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		log.Printf("[ERROR] Failed to connect to Google API: %s", err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, nil
	}

	var employeeShifts *TimesheetConstants.Timesheet

	switch upcoming {
	case true:
		log.Printf("[INFO] Getting upcoming shifts for employee: %s", employeeId)
		upcomingSchedule, err := sheetsService.GetUpcomingSchedule()
		if err != nil {
			log.Printf("[ERROR] Failed to retrieve upcoming schedule from google sheets: %s", err.Error())
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
			}, nil
		}

		employeeShifts = getUpcomingShifts(employeeId, upcomingSchedule)
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

		employeeShifts = getShiftsForEmployee(employeeId, schedule, upcoming)
	}

	res, _ := json.Marshal(employeeShifts)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, err
}

func getUpcomingShifts(employeeId string, schedule *GoogleClient.GetScheduleResponse) *TimesheetConstants.Timesheet {
	employeeShifts := []TimesheetConstants.EmployeeShift{}

	for i := 0; i < len(schedule.EmployeeIds); i++ {
		if schedule.EmployeeIds[i][0] == employeeId {
			employeeShifts = append(employeeShifts, TimesheetConstants.EmployeeShift{
				ShiftTitle:    schedule.ShiftNames[i][0].(string),
				Date:          schedule.Shifts[i][0].(string),
				StartTime:     schedule.Shifts[i][1].(string),
				EndTime:       schedule.Shifts[i][2].(string),
				BreakDuration: schedule.Shifts[i][3].(string),
			})
		}
	}

	// upcoming shifts sorted in desc date, need to return in asc date order
	for i, j := 0, len(employeeShifts)-1; i < j; i, j = i+1, j-1 {
		employeeShifts[i], employeeShifts[j] = employeeShifts[j], employeeShifts[i]
	}

	return &TimesheetConstants.Timesheet{
		Shifts: employeeShifts,
	}
}

func getShiftsForEmployee(employeeId string, schedule [][]interface{}, getUpcomingShifts bool) *TimesheetConstants.Timesheet {
	if getUpcomingShifts {
		schedule = filterForUpcomingShifts(schedule)
		log.Printf("[INFO] Found upcoming schedule: %v", schedule)
	}

	timesheetProcessor := TimesheetProcessor.New(employeeId)
	for _, row := range schedule {
		timesheetProcessor.ProcessRow(row)
	}
	timesheetForEmployee := timesheetProcessor.GetTimesheet()
	log.Printf("[INFO] Found shifts for employee (%s): %v", employeeId, timesheetForEmployee)

	return &timesheetForEmployee
}

func filterForUpcomingShifts(masterTimesheet [][]interface{}) [][]interface{} {
	upcomingShifts := [][]interface{}{}
	today := TimeService.GetToday()
	log.Printf("[INFO] Today: %s", today.String())

	dateCol := SharedUtil.GetIndexOfColumn(TimesheetConstants.DATE_COLUMN)
	for i := len(masterTimesheet) - 1; i > -1; i-- {
		shiftDate := masterTimesheet[i][dateCol].(string)
		convertedDate := TimeService.ConvertDateToTime(shiftDate)

		shiftIsUpcoming := convertedDate.After(today) || convertedDate.Equal(today)
		if !shiftIsUpcoming {
			break
		}

		upcomingShifts = append(upcomingShifts, masterTimesheet[i])
	}

	for i, j := 0, len(upcomingShifts)-1; i < j; i, j = i+1, j-1 { // reverse
		upcomingShifts[i], upcomingShifts[j] = upcomingShifts[j], upcomingShifts[i]
	}
	return upcomingShifts
}
