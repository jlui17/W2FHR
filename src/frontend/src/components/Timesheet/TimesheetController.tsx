import axios from "axios";
import { getTimesheetApiUrlForEmployee } from "../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../common/constants";
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

export const getTimesheetData = async (
  employeeId: string,
  getUpcoming: boolean
): Promise<TimesheetData> => {
  const response = await axios.get(
    getTimesheetApiUrlForEmployee(employeeId, getUpcoming)
  );

  switch (response.status) {
    case 200:
      const timesheetData = response.data as TimesheetData;
      return Promise.resolve(timesheetData);
    case 404:
      return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
    default:
      return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
  }
};

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
