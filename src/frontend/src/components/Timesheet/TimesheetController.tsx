import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { AlertInfo, AlertType } from "../common/Alerts";
import { ERROR_MESSAGES } from "../common/constants";
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

export const TimesheetController = (): JSX.Element => {
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const { getAuthSession } = useContext(AuthenticationContext);
  const { isFetching, data, isError, error, isRefetchError } = useTimesheetData(
    { idToken: getAuthSession()?.IdToken || "", getUpcoming: false }
  );

  useEffect(() => {
    if (isError || isRefetchError) {
      console.error(`Error while fetching timesheet:\n${error}`);
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

  if (!data) {
    return (
      <TimesheetWidget
        alert={alert}
        closeAlert={() => setAlert(null)}
        isLoading={false}
        timesheetData={EMPTY_DATA}
      />
    );
  }

  return (
    <TimesheetWidget
      alert={alert}
      closeAlert={() => setAlert(null)}
      isLoading={isFetching}
      timesheetData={data}
    />
  );
};
