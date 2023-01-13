import axios from "axios";
import { useQuery } from "react-query";
import { getTimesheetApiUrlForEmployee } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../../common/constants";
import { TimesheetData } from "../TimesheetController";

const isTimesheetData = (data: any): data is TimesheetData => {
  return "shifts" in data;
};

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
        if (!isTimesheetData(response.data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGSES.SERVER.DATA_INCONSISTENT)
          );
        }
        return Promise.resolve(response.data);
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGSES.SERVER.GENERAL_ERROR));
    }
  };

  return useQuery("timesheetData", () =>
    getTimesheetData(employeeId, getUpcoming)
  );
};
