package GetTimesheet

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
	"GoogleSheets/packages/common/Constants/TimesheetConstants"
	"GoogleSheets/packages/common/GoogleClient"
	"GoogleSheets/packages/common/TimeService"
	"GoogleSheets/packages/common/Utilities/SharedUtil"
	"GoogleSheets/packages/common/Utilities/TimesheetUtil"
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

	employeeShifts, err := getShiftsForEmployee(employeeId, schedule, getUpcomingShifts)
	if err != nil {
		log.Printf("[ERROR] Failed to filter timesheet for %s: %s", employeeId, err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		}, err
	}
	res, _ := json.Marshal(employeeShifts)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    SharedConstants.ALLOW_ORIGINS_HEADER,
		Body:       fmt.Sprint(string(res)),
	}, err
}

func getShiftsForEmployee(employeeId string, schedule [][]interface{}, getUpcomingShifts bool) (*TimesheetConstants.Timesheet, error) {
	if getUpcomingShifts {
		schedule = filterForUpcomingShifts(schedule)
		log.Printf("[INFO] Found upcoming schedule: %v", schedule)
	}

	unformattedEmployeeShifts := filterShiftsByEmployeeId(employeeId, schedule)
	formattedEmployeeShifts := TimesheetUtil.FormatEmployeeShifts(unformattedEmployeeShifts)
	log.Printf("[INFO] Found shifts for employee (%s): %v", employeeId, formattedEmployeeShifts)

	return &TimesheetConstants.Timesheet{
		Shifts: formattedEmployeeShifts,
	}, nil
}

func filterShiftsByEmployeeId(employeeId string, masterTimesheet [][]interface{}) [][]string {
	employeeShifts := [][]string{}

	employeeIdColumn := SharedUtil.GetIndexOfColumn(TimesheetConstants.EMPLOYEE_ID_COLUMN)
	for _, shift := range masterTimesheet {
		isThisEmployeesShift := shift[employeeIdColumn].(string) == employeeId
		if isThisEmployeesShift {
			convertedEmployeeShift := TimesheetUtil.ConvertShiftInterfaceSliceToStringSlice(shift)
			employeeShifts = append(employeeShifts, convertedEmployeeShift)
		}
	}

	return employeeShifts
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
