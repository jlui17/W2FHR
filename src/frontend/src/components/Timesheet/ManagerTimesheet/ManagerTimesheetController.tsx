import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useAlert, AlertType, AlertInfo } from "@/components/common/Alerts";
import { useContext, useState } from "react";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";
import { useTimesheetData } from "../helpers/hooks";
import { ERROR_MESSAGES } from "@/components/common/constants";


export interface Shift {
  date: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  netHours: number;
}

export interface ManagerTimesheetData {
  shifts: AllSchedules[];
}

export interface AllSchedules {
  EmployeeIds: string[][];
  ShiftNames: string[][];
  Shifts: string[][];
}



const ManagerTimesheetController = (): JSX.Element => {
  const { getAuthSession } = useContext(AuthenticationContext);
  const {
    refetch,
    isFetching,
    isError,
    data: shiftHistory,
  } = useTimesheetData({
    idToken: getAuthSession()?.IdToken || "",
    getUpcoming: true,
    all: true,
  });

  const data = shiftHistory as ManagerTimesheetData;

  if(data)
  {
    return (
      <div>
        {data.shifts.map((shiftGroup, i) => (
          <div key={i}>
            <h1>{shiftGroup.EmployeeIds[0][0]}</h1>
            {shiftGroup.Shifts.map((shift, j) => (
              <div key={j} className="mb-6 flex flex-col">
                <p className="text-md">{shift[0]}</p>
                <p className="text-sm">{shiftGroup.ShiftNames[0][0]}</p>
                <p className="text-sm text-gray-600">Start: {shift[1]}</p>
                <p className="text-sm text-gray-600">End: {shift[2]}</p>
                <p className="text-sm text-gray-600">Break Duration: {shift[3]}</p>
                <p className="text-sm text-gray-600">Net Hours: {shift[4]}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
  );

  }else{

    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }


};
export const ManagerTimesheet = (): JSX.Element => {
  const { setAlert } = useAlert();
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in ManagerTimesheet:\n${error}`);
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
      <ManagerTimesheetController />
    </QueryClientProvider>
  );

};
