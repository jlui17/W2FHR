import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { ReactElement, useContext } from "react";
import { toast } from "sonner";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ERROR_MESSAGES, TOAST } from "../common/constants";
import { TimesheetData, useTimesheetData } from "../Timesheet/helpers/hooks";
import { UpcomingShiftsWidget } from "./UpcomingShiftsWidget";

const EMPTY_DATA: TimesheetData = { shifts: [] };

const UpcomingShiftsController = (): ReactElement => {
  const { getAuthSession } = useContext(AuthenticationContext);

  try {
    const {
      isFetching: upcomingShiftsDataIsLoading,
      data: upcomingShiftsData,
    } = useTimesheetData({
      idToken: getAuthSession()?.idToken || "",
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
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in UpcomingShifts:\n${error}`);
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
      <UpcomingShiftsController />
    </QueryClientProvider>
  );
};
