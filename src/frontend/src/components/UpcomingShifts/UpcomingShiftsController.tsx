import { useContext } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { useTimesheetData } from "../Timesheet/helpers/hooks";
import { TimesheetData } from "../Timesheet/TimesheetController";
import { UpcomingShiftsWidget } from "./UpcomingShiftsWidget";

const EMPTY_DATA: TimesheetData = { shifts: [] };

const UpcomingShiftsController = (): JSX.Element => {
  const { authSession } = useContext(AuthenticationContext);

  try {
    const { isLoading: upcomingShiftsDataIsLoading, data: upcomingShiftsData } =
      useTimesheetData({
        idToken: authSession?.IdToken || "",
        getUpcoming: true,
      });

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
      <UpcomingShiftsController />
    </QueryClientProvider>
  );
};
