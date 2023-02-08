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
  const displayUpcomingShifts = () => {
    return (
      <div className="mt-2 grid grid-cols-5">
        {upcomingShiftsData.shifts.map((shift: Shift, i: number) => {
          return (
            <>
              <div className="col-span-4 flex flex-col items-start justify-between">
                <p className="text-md">{shift.date}</p>
                <p className="text-sm text-gray-600">{shift.shiftTitle}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <p className="text-sm">{shift.startTime}</p>
                <p className="text-sm text-gray-600">{shift.endTime}</p>
              </div>
              {i + 1 === upcomingShiftsData.shifts.length ? null : (
                <Divider className="col-span-5 my-2" />
              )}
            </>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="mt-6 w-80">
      <CardContent>
        <>
          <Typography className="text-lg font-bold">Upcoming Shifts</Typography>
          {isLoading ? <CircularProgress /> : displayUpcomingShifts()}
        </>
      </CardContent>
    </Card>
  );
};
