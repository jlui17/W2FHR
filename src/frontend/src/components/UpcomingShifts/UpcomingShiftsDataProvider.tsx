import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { getTimesheetApiUrlForEmployee } from "../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../common/constants";
import { TimesheetData } from "../Timesheet/TimesheetDataProvider";
import { UpcomingShiftsWidget } from "./TimesheetWidget";

export const getUpcomingShiftsData = async (
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

const UpcomingShiftsDataProvider = (): JSX.Element => {
  const EMPTY_DATA: TimesheetData = { shifts: [] };

  try {
    const { isLoading: upcomingShiftsDataIsLoading, data: upcomingShiftsData } =
      useQuery("upcomingShiftsData", () =>
        getUpcomingShiftsData("w2fnm150009", true)
      );

    if (upcomingShiftsDataIsLoading) {
      return <UpcomingShiftsWidget isLoading upcomingShiftsData={EMPTY_DATA} />;
    }

    if (!upcomingShiftsData) {
      return (
        <UpcomingShiftsWidget
          isLoading={false}
          upcomingShiftsData={EMPTY_DATA}
        />
      );
    }

    return (
      <UpcomingShiftsWidget
        isLoading={false}
        upcomingShiftsData={upcomingShiftsData}
      />
    );
  } catch (err) {
    return <UpcomingShiftsWidget isLoading upcomingShiftsData={EMPTY_DATA} />;
  }
};

export const UpcomingShifts = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <UpcomingShiftsDataProvider />
    </QueryClientProvider>
  );
};
