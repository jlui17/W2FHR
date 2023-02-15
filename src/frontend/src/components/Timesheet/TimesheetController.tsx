import { useContext } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "react-query";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../common/Alerts";
import { ERROR_MESSAGES } from "../common/constants";
import ExpandableCard from "../common/ExpandableCard";
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

const EMPTY_DATA: TimesheetData = { shifts: [] };

const TimesheetController = (): JSX.Element => {
  const { getAuthSession } = useContext(AuthenticationContext);
  const { isFetching, data } = useTimesheetData({
    idToken: getAuthSession()?.IdToken || "",
    getUpcoming: false,
  });

  if (!data) {
    return <TimesheetWidget isLoading={false} timesheetData={EMPTY_DATA} />;
  }

  return <TimesheetWidget isLoading={isFetching} timesheetData={data} />;
};

export const Timesheet = (): JSX.Element => {
  const { setAlert } = useAlert();
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in Timesheet:\n${error}`);
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        };
        if (error instanceof Error) {
          errorAlert.message = error.message;
        }
        setAlert(errorAlert);
      },
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ExpandableCard
        className="my-6 flex w-72 flex-col items-center justify-center"
        headerTitle="Shift History"
      >
        <TimesheetController />
      </ExpandableCard>
    </QueryClientProvider>
  );
};
