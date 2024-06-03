import { CircularProgress, Divider } from "@mui/material";
import { TimesheetData } from "./TimesheetController";

interface TimesheetWidgetProps {
  isLoading: boolean;
  timesheetData: TimesheetData;
}

export const TimesheetWidget = ({
  isLoading,
  timesheetData,
}: TimesheetWidgetProps): JSX.Element => {
  const hasNoShifts = timesheetData.shifts.length === 0;

  const displayEmptyTimesheet = (): JSX.Element => {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm text-gray-600">
          You haven't worked any shifts yet
        </p>
      </div>
    );
  };

  const displayTimesheet = (): JSX.Element => {
    return (
      <div className="mt-2 flex flex-col">
        {timesheetData.shifts.map((shift, i) => {
          return (
            <div className="flex flex-col">
              <p className="text-md">{shift.date}</p>
              <p className="text-sm">{shift.shiftTitle}</p>
              <p className="text-sm text-gray-600">Start: {shift.startTime}</p>
              <p className="text-sm text-gray-600">End: {shift.endTime}</p>
              <p className="text-sm text-gray-600">
                Break Duration: {shift.breakDuration}
              </p>
              <p className="text-sm text-gray-600">Net Hours: {shift.netHours}</p>
              {i + 1 !== timesheetData.shifts.length ? (
                <Divider className="my-2" />
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {isLoading ? (
        <CircularProgress />
      ) : hasNoShifts ? (
        displayEmptyTimesheet()
      ) : (
        displayTimesheet()
      )}
    </div>
  );
};
