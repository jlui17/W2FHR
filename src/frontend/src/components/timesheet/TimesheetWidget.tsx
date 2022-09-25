import { Timesheet } from "../../helpers/API_CONSTANTS";

interface TimesheetWidgetProps {
  timesheet: Timesheet;
  isLoading: boolean;
}

export const TimesheetWidget = ({
  timesheet,
  isLoading,
}: TimesheetWidgetProps) => {
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {timesheet.shifts.map((shift) => {
        return (
          <div>
            {shift.date}
            <br />
            {shift.shiftTitle}
            <br />
            {shift.startTime}
            <br />
            {shift.endTime}
            <br />
            {shift.breakDuration}
            <br />
            ----
          </div>
        );
      })}
      {timesheet.viewingDates.map((date) => {
        return (
          <div>
            {date}
            <br />
          </div>
        );
      })}
    </>
  );
};
