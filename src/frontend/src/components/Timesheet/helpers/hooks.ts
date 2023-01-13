import axios from "axios";
import { useQuery } from "react-query";
import { getTimesheetApiUrlForEmployee } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../../common/constants";
import { TimesheetData } from "../TimesheetController";

export const useTimesheetData = (employeeId: string, getUpcoming: boolean) => {
  const getTimesheetData = async (
    employeeId: string,
    getUpcoming: boolean
  ): Promise<TimesheetData> => {
    const response = await axios.get(
      getTimesheetApiUrlForEmployee(employeeId, getUpcoming)
    );

    switch (response.status) {
      case 200:
        const timesheetData = response.data as TimesheetData;
        return Promise.resolve(timesheetData);
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
    }
  };

  return useQuery("timesheetData", () =>
    getTimesheetData(employeeId, getUpcoming)
  );
};
