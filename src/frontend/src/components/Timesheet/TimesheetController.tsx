import { useTimesheetData } from "./helpers/hooks";
import { TimesheetWidget } from "./TimesheetWidget";

export interface Shift {
  date: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
}

export interface TimesheetData {
  shifts: Shift[];
}

export const TimesheetController = (): JSX.Element => {
  const EMPTY_DATA: TimesheetData = { shifts: [] };

  const { isLoading: timesheetDataIsLoading, data: timesheetData } =
    useTimesheetData("w2fnm150009", false);

  if (timesheetDataIsLoading) {
    return <TimesheetWidget isLoading timesheetData={EMPTY_DATA} />;
  }

  if (!timesheetData) {
    return <TimesheetWidget isLoading={false} timesheetData={EMPTY_DATA} />;
  }

  return <TimesheetWidget isLoading={false} timesheetData={timesheetData} />;
};
