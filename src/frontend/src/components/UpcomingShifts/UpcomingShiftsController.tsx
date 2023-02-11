import { useContext, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../common/Alerts";
import { ERROR_MESSAGES } from "../common/constants";
import { useTimesheetData } from "../Timesheet/helpers/hooks";
import { TimesheetData } from "../Timesheet/TimesheetController";
import { UpcomingShiftsWidget } from "./UpcomingShiftsWidget";

const EMPTY_DATA: TimesheetData = { shifts: [] };

const UpcomingShiftsController = (): JSX.Element => {
  const { getAuthSession } = useContext(AuthenticationContext);
  const { setAlert } = useAlert();

  try {
    const {
      isFetching: upcomingShiftsDataIsLoading,
      data: upcomingShiftsData,
      isError,
      error,
      isRefetchError,
    } = useTimesheetData({
      idToken: getAuthSession()?.IdToken || "",
      getUpcoming: true,
    });

    useEffect(() => {
      if (isError || isRefetchError) {
        console.error(`Error while fetching upcoming shifts:\n${error}`);
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        };

        if (error instanceof Error) {
          errorAlert.message = error.message;
        }
        setAlert(errorAlert);
      }
    }, [isError, isRefetchError, error]);

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
