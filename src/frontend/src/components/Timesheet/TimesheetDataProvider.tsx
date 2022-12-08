import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { getTimesheetApiUrlForEmployee } from "../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../common/constants";
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

const TimesheetDataProvider = (): JSX.Element => {
  const EMPTY_DATA: TimesheetData = { shifts: [] };

  try {
    const { isLoading: timesheetDataIsLoading, data: timesheetData } = useQuery(
      "timesheetData",
      () => getTimesheetData("w2fnm150009", false)
    );

    const { isLoading: upcomingShiftsDataIsLoading, data: upcomingShiftsData } =
      useQuery("upcomingShiftsData", () =>
        getTimesheetData("w2fnm150009", true)
      );

    if (timesheetDataIsLoading || upcomingShiftsDataIsLoading) {
      return (
        <TimesheetWidget
          isLoading
          timesheetData={EMPTY_DATA}
          upcomingShiftsData={EMPTY_DATA}
        />
      );
    }

    if (!timesheetData || !upcomingShiftsData) {
      return (
        <TimesheetWidget
          isLoading={false}
          timesheetData={EMPTY_DATA}
          upcomingShiftsData={EMPTY_DATA}
        />
      );
    }

    return (
      <TimesheetWidget
        isLoading={false}
        timesheetData={timesheetData}
        upcomingShiftsData={upcomingShiftsData}
      />
    );
  } catch (err) {
    return (
      <TimesheetWidget
        isLoading
        timesheetData={EMPTY_DATA}
        upcomingShiftsData={EMPTY_DATA}
      />
    );
  }
};

export const Timesheet = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TimesheetDataProvider />
    </QueryClientProvider>
  );
};
