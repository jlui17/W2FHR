import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Shift, TimesheetData } from "../Timesheet/TimesheetDataProvider";

interface UpcomingShiftsWidgetProps {
  isLoading: boolean;
  upcomingShiftsData: TimesheetData;
}

export const UpcomingShiftsWidget = ({
  isLoading,
  upcomingShiftsData,
}: UpcomingShiftsWidgetProps): JSX.Element => {
  const getUpcomingShiftsTable = (shifts: Shift[]): JSX.Element => {
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
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <h2>Upcoming Shifts</h2>
          {getUpcomingShiftsTable(upcomingShiftsData.shifts)}
        </>
      )}
    </div>
  );
};
