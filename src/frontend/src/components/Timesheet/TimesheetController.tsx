import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useContext, useState } from "react";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../common/Alerts";
import { ERROR_MESSAGES } from "../common/constants";
import { useTimesheetData } from "./helpers/hooks";
import { TimesheetWidget } from "./TimesheetWidget";

export interface Shift {
  date: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  netHours: number;
}

export interface TimesheetData {
  shifts: Shift[];
}

const EMPTY_DATA: TimesheetData = { shifts: [] };

const TimesheetController = (): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const { getAuthSession } = useContext(AuthenticationContext);
  const {
    refetch,
    isFetching,
    data: userAvailability,
  } = useTimesheetData({
    idToken: getAuthSession()?.IdToken || "",
    getUpcoming: false,
  });

  function onOpenChange(): void {
    if (!open && userAvailability === undefined) {
      refetch();
    }
    setOpen(!open);
  }

  if (!open) {
    return (
      <TimesheetWidget
        isLoading={false}
        timesheetData={EMPTY_DATA}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  if (!userAvailability) {
    return (
      <TimesheetWidget
        isLoading={isFetching}
        timesheetData={EMPTY_DATA}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  return (
    <TimesheetWidget
      isLoading={isFetching}
      timesheetData={EMPTY_DATA}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
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
      <TimesheetController />
    </QueryClientProvider>
  );
};
