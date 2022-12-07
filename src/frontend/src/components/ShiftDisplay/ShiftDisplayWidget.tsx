import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Shift, TimesheetData } from "./ShiftDisplayDataProvider";

interface ShiftDisplayWidgetProps {
  isLoading: boolean;
  timesheetData: TimesheetData;
}

export const ShiftDisplayWidget = (
  props: ShiftDisplayWidgetProps
): JSX.Element => {
  const { isLoading, timesheetData } = props;

  const getShiftDisplayTable = (): JSX.Element => {
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
            {timesheetData.shifts.map((shift: Shift) => (
              <TableRow>
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
      <h1>Shifts</h1>
      {isLoading ? <CircularProgress /> : getShiftDisplayTable()}
    </div>
  );
};
