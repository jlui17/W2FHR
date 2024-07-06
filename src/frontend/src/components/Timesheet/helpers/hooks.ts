import { useQuery } from "@tanstack/react-query";
import { getTimesheetApiUrlForEmployee } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGES } from "../../common/constants";
import { TimesheetData } from "../TimesheetController";

const isTimesheetData = (data: any): data is TimesheetData => {
  return "shifts" in data;
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
