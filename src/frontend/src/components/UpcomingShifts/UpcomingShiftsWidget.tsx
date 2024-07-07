import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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

  const noUpcomingShifts = () => {
    return (
      <div className="mt-2 flex flex-col items-center justify-center">
        <p className="text-sm text-gray-600">You have no upcoming shifts</p>
      </div>
    );
  };

  const upcomingShifts = () => {
    return (
      <div className="mt-2 flex flex-col">
        {upcomingShiftsData.shifts.map((shift: Shift, i: number) => {
          return (
            <div className="mb-6 flex flex-col" key={i}>
              <p className="text-md">{shift.date}</p>
              <p className="text-sm">{shift.shiftTitle}</p>
              <p className="text-sm text-gray-600">Start: {shift.startTime}</p>
              <p className="text-sm text-gray-600">End: {shift.endTime}</p>
              <p className="text-sm text-gray-600">
                Break Duration: {shift.breakDuration}
              </p>
              <p className="text-sm text-gray-600">
                Net Hours: {shift.netHours}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-11/12 md:w-auto">
      <CardHeader>
        <CardTitle className="m-auto">Upcoming Shifts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="m-auto h-16 w-16 animate-spin" />
        ) : hasNoUpcomingShifts ? (
          noUpcomingShifts()
        ) : (
          upcomingShifts()
        )}
      </CardContent>
    </Card>
  );
};
