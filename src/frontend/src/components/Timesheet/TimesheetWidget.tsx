import { CircularProgress, Divider } from "@mui/material";
import { TimesheetData } from "./TimesheetController";

interface TimesheetWidgetProps {
  isLoading: boolean;
  timesheetData: TimesheetData;
}

//i think u guys have an hours work data but this works too
function calculateHoursWorked(startTime: string, endTime: string, breakDuration: string): string {
  function parseTime(timeStr: string): Date {
    const time = new Date();
    const [timePart, period] = timeStr.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    
    const hoursAdjusted = period.toLowerCase() === 'am' ? (hours % 12) : (hours % 12) + 12;
    time.setHours(hoursAdjusted, minutes, 0, 0);
    return time;
  }

  function parseDuration(duration: string): number {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  }

  function formatDuration(minutes: number): string {
    const totalSeconds = Math.round(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours}:${padZero(minutesLeft)}:${padZero(seconds)}`;
  }

  function padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const breakMins = parseDuration(breakDuration);

  const totalMinutesWorked = (end.getTime() - start.getTime()) / 60000 - breakMins;

  return "Hours worked: " + formatDuration(totalMinutesWorked);
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
              <p className="text-sm text-gray-600">{calculateHoursWorked(shift.startTime, shift.endTime, shift.breakDuration)}</p>
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
