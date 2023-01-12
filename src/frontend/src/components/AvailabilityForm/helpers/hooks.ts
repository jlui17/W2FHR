import axios from "axios";
import { useQuery } from "react-query";
import { getAvailabilityApiUrlForEmployee } from "../../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../../common/constants";
import { AvailabilityData } from "../AvailabilityController";

const isAvailabilityData = (data: any): data is AvailabilityData => {
  return (
    "day1" in data &&
    "day2" in data &&
    "day3" in data &&
    "day4" in data &&
    "canUpdate" in data
  );
};

export const useAvailabilityData = (
  employeeId: string,
  setAvailabilityData: (data: AvailabilityData) => void
) => {
  const fetchAvailability = async (): Promise<void> => {
    const response = await axios.get(
      getAvailabilityApiUrlForEmployee(employeeId)
    );

    switch (response.status) {
      case 200:
        if (!isAvailabilityData(response.data)) {
          return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
        }
        setAvailabilityData(response.data);
        return Promise.resolve();
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
    }
  };

  return useQuery("availability", fetchAvailability);
};

export const useUpdateAvailability = (
  employeeId: string,
  availabilityData: AvailabilityData,
  setAvailabilityData: (data: AvailabilityData) => void
) => {
  return async () => {
    const response = await axios.post(
      getAvailabilityApiUrlForEmployee(employeeId),
      availabilityData
    );

    switch (response.status) {
      case 200:
        if (!isAvailabilityData(response.data)) {
          return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
        }
        setAvailabilityData(response.data);
        return Promise.resolve();
      case 403:
        return Promise.reject(new Error(ERROR_MESSAGSES.UPDATE_DISABLED));
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGSES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGSES.SERVER_ERROR));
    }
  };
};
