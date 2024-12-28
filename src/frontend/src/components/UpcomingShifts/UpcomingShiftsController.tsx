import React, { ReactElement, useContext } from "react";
import { AuthenticationContext } from "../AuthenticationContextProvider";
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

export const UpcomingShifts = (): ReactElement => {
  return <UpcomingShiftsController />;
};
