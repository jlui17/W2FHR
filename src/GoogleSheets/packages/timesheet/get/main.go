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

func HandleRequest(employeeId string, getUpcomingShifts bool) (events.APIGatewayProxyResponse, error) {
	sheetsService, err := GoogleClient.New()
	if err != nil {
		log.Printf("[ERROR] Failed to connect to Google API: %s", err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, err
	}

	schedule, err := sheetsService.GetSchedule()
	if err != nil {
		log.Printf("[ERROR] Failed to retrieve schedule from google sheets: %s", err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, err
	}

	employeeShifts := getShiftsForEmployee(employeeId, schedule, getUpcomingShifts)
	res, _ := json.Marshal(employeeShifts)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, err
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
