import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ERROR_MESSAGES, TOAST } from "../common/constants";
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
    data: shiftHistory,
  } = useTimesheetData({
    idToken: getAuthSession()?.idToken || "",
    getUpcoming: false,
  });

  function onOpenChange(): void {
    if (!open && shiftHistory === undefined) {
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

  if (!shiftHistory) {
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
      timesheetData={shiftHistory}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
};

export const Timesheet = (): JSX.Element => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in Timesheet:\n${error}`);
        let errMsg: string = ERROR_MESSAGES.UNKNOWN_ERROR;
        if (error instanceof Error) {
          errMsg = error.message;
        }
        toast.error(TOAST.HEADERS.ERROR, {
          description: errMsg,
          duration: TOAST.DURATIONS.ERROR,
        });
      },
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TimesheetController />
    </QueryClientProvider>
  );
};
