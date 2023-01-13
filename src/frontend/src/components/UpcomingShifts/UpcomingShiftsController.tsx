import { QueryClient, QueryClientProvider } from "react-query";
import { useTimesheetData } from "../Timesheet/helpers/hooks";
import { TimesheetData } from "../Timesheet/TimesheetController";
import { UpcomingShiftsWidget } from "./UpcomingShiftsWidget";

const UpcomingShiftsController = (): JSX.Element => {
  const EMPTY_DATA: TimesheetData = { shifts: [] };

  try {
    const { isLoading: upcomingShiftsDataIsLoading, data: upcomingShiftsData } =
      useTimesheetData("w2fnm150009", true);

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
