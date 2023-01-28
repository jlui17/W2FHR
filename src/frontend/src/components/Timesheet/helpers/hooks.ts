import axios from "axios";
import { useQuery } from "react-query";
import { getTimesheetApiUrlForEmployee } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGES } from "../../common/constants";
import { TimesheetData } from "../TimesheetController";

const isTimesheetData = (data: any): data is TimesheetData => {
  return "shifts" in data;
};

interface UseTimesheetDataProps {
  idToken: string;
  getUpcoming: boolean;
}
export const useTimesheetData = ({
  idToken,
  getUpcoming,
}: UseTimesheetDataProps) => {
  const getTimesheetData = async (): Promise<TimesheetData> => {
    const response = await axios.get(
      getTimesheetApiUrlForEmployee(getUpcoming),
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        if (!isTimesheetData(response.data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT)
          );
        }
        return Promise.resolve(response.data);
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  };

  return useQuery("timesheetData", getTimesheetData);
};
