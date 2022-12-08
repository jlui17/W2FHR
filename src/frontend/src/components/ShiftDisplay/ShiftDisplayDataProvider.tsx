import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { getTimesheetApiUrlForEmployee } from "../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../common/constants";
import { ShiftDisplayWidget } from "./ShiftDisplayWidget";

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

export const getTimesheetData = async (): Promise<TimesheetData> => {
  const employeeId = "w2fnm150009";
  const response = await axios.get(getTimesheetApiUrlForEmployee(employeeId));

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

const ShiftDisplayDataProvider = (): JSX.Element => {
  const EMPTY_DATA: TimesheetData = { shifts: [] };

  try {
    const { isLoading, data } = useQuery("timesheetData", getTimesheetData);

    if (isLoading) {
      return <ShiftDisplayWidget isLoading timesheetData={EMPTY_DATA} />;
    }

    if (!data) {
      return (
        <ShiftDisplayWidget isLoading={false} timesheetData={EMPTY_DATA} />
      );
    }

    return <ShiftDisplayWidget isLoading={false} timesheetData={data} />;
  } catch (err) {
    return <ShiftDisplayWidget isLoading timesheetData={EMPTY_DATA} />;
  }
};

export const ShiftDisplay = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ShiftDisplayDataProvider />
    </QueryClientProvider>
  );
};
