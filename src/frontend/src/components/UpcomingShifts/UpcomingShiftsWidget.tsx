import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Shift, TimesheetData } from "../Timesheet/TimesheetController";

interface UpcomingShiftsWidgetProps {
  isLoading: boolean;
  upcomingShiftsData: TimesheetData;
}

export const UpcomingShiftsWidget = ({
  isLoading,
  upcomingShiftsData,
}: UpcomingShiftsWidgetProps): JSX.Element => {
  const hasNoUpcomingShifts = upcomingShiftsData.shifts.length === 0;

  const displayNoUpcomingShifts = () => {
    return (
      <div className="mt-2 flex flex-col items-center justify-center">
        <p className="text-sm text-gray-600">You have no upcoming shifts</p>
      </div>
    );
  };

  const displayUpcomingShifts = () => {
    return (
      <div className="mt-2 flex flex-col">
        {upcomingShiftsData.shifts.map((shift: Shift, i: number) => {
          return (
            <div className="flex flex-col" key={i}>
              <p className="text-md">{shift.date}</p>
              <p className="text-sm">{shift.shiftTitle}</p>
              <p className="text-sm text-gray-600">Start: {shift.startTime}</p>
              <p className="text-sm text-gray-600">End: {shift.endTime}</p>
              <p className="text-sm text-gray-600">
                Break Duration: {shift.breakDuration}
              </p>
              <p className="text-sm text-gray-600">Net Hours: {shift.netHours}</p>
              {i + 1 !== upcomingShiftsData.shifts.length ? (
                <Divider className="my-2" />
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="mt-6 w-80 md:mt-0">
      <CardContent>
        <>
          <Typography className="text-lg font-bold">Upcoming Shifts</Typography>
          {isLoading ? (
            <CircularProgress />
          ) : hasNoUpcomingShifts ? (
            displayNoUpcomingShifts()
          ) : (
            displayUpcomingShifts()
          )}
        </>
      </CardContent>
    </Card>
  );
};
