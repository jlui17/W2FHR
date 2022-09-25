import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Timesheet } from "../../helpers/API_CONSTANTS";

interface TimesheetWidgetProps {
  timesheet: Timesheet;
  isLoading: boolean;
  employeeId: string;
  setEmployeeId: React.Dispatch<React.SetStateAction<string>>;
  refreshTimesheet: (e: any) => void;
}

export const TimesheetWidget = ({
  timesheet,
  isLoading,
  employeeId,
  setEmployeeId,
  refreshTimesheet,
}: TimesheetWidgetProps) => {
  if (isLoading) return <div>Loading...</div>;

  const updateEmployeeId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeId(event.target.value);
  };

  return (
    <>
      <Form.Control
        value={employeeId}
        type="text"
        size="sm"
        onChange={updateEmployeeId}
      />
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
      <Button variant="secondary" onClick={refreshTimesheet}>
        Refresh
      </Button>
    </>
  );
};
