import { useQuery } from "@tanstack/react-query";
import { getTimesheetApiUrlForEmployee } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGES } from "../../common/constants";

export interface Shift {
  date: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  netHours: number;
  employeeName: string;
}

export interface TimesheetData {
  shifts: Shift[];
}

function isShift(obj: any): obj is Shift {
  return (
    typeof obj === "object" &&
    "date" in obj &&
    "shiftTitle" in obj &&
    "startTime" in obj &&
    "endTime" in obj &&
    "breakDuration" in obj &&
    "netHours" in obj &&
    "employeeName" in obj
  );
}

export const isTimesheetData = (data: any): data is TimesheetData => {
  return typeof data === "object" &&
    "shifts" in data &&
    Array.isArray(data.shifts) &&
    data.shifts.every(isShift);
};

export function useTimesheetData(p: { idToken: string; getUpcoming: boolean }) {
  const getTimesheetData = async (): Promise<TimesheetData> => {
    const response = await fetch(getTimesheetApiUrlForEmployee(p.getUpcoming), {
      headers: {
        Authorization: `Bearer ${p.idToken}`,
      },
      mode: "cors",
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        if (!isTimesheetData(data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT)
          );
        }
        return Promise.resolve(data);
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  };

  return useQuery({
    queryKey: ["timesheetData", p.getUpcoming],
    queryFn: getTimesheetData,
    enabled: p.getUpcoming,
  });
}
