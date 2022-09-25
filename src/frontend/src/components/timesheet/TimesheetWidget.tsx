import { EmployeeShift } from "../../helpers/API_CONSTANTS";

interface TimesheetWidgetProps {
  timesheet: EmployeeShift[];
  isLoading: boolean;
}

export const TimesheetWidget = ({
  timesheet,
  isLoading,
}: TimesheetWidgetProps) => {
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {timesheet.map((shift) => (
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
      ))}
    </>
  );
};
