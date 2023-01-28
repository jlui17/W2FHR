import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { AlertInfo, displayAlert } from "../common/Alerts";
import { Shift, TimesheetData } from "./TimesheetController";

interface TimesheetWidgetProps {
  isLoading: boolean;
  timesheetData: TimesheetData;
  alert: AlertInfo | null;
  closeAlert: () => void;
}

export const TimesheetWidget = ({
  isLoading,
  timesheetData,
  alert,
  closeAlert,
}: TimesheetWidgetProps): JSX.Element => {
  const getTimesheetTable = (shifts: Shift[]): JSX.Element => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Shift Title</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Break Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts.map((shift: Shift) => (
              <TableRow key={shift.date + shift.startTime}>
                <TableCell>{shift.date}</TableCell>
                <TableCell>{shift.shiftTitle}</TableCell>
                <TableCell>{shift.startTime}</TableCell>
                <TableCell>{shift.endTime}</TableCell>
                <TableCell>{shift.breakDuration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      {displayAlert(alert, closeAlert)}
      {isLoading ? (
        <CircularProgress />
      ) : (
        getTimesheetTable(timesheetData.shifts)
      )}
    </div>
  );
};
