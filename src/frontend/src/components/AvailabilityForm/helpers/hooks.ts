import axios from "axios";
import { useQuery } from "react-query";
import { API_URLS, ERROR_MESSAGES } from "../../common/constants";
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

interface UseAvailabilityDataProps {
  setAvailabilityData: (data: AvailabilityData) => void;
  idToken: string;
}
export const useAvailabilityData = ({
  setAvailabilityData,
  idToken,
}: UseAvailabilityDataProps) => {
  const fetchAvailability = async (): Promise<void> => {
    const response = await axios.get(API_URLS.AVAILABILITY, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    switch (response.status) {
      case 200:
        if (!isAvailabilityData(response.data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT)
          );
        }
        setAvailabilityData(response.data);
        return Promise.resolve();
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  };

  return useQuery("availability", fetchAvailability);
};

interface UseUpdateAvailabilityProps {
  availabilityData: AvailabilityData;
  setAvailabilityData: (data: AvailabilityData) => void;
  idToken: string;
}
export const useUpdateAvailability = ({
  availabilityData,
  setAvailabilityData,
  idToken,
}: UseUpdateAvailabilityProps) => {
  const updateAvailability = async (): Promise<void> => {
    const response = await axios.post(API_URLS.AVAILABILITY, availabilityData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    switch (response.status) {
      case 200:
        if (!isAvailabilityData(response.data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT)
          );
        }
        setAvailabilityData(response.data);
        return Promise.resolve();
      case 403:
        return Promise.reject(new Error(ERROR_MESSAGES.UPDATE_DISABLED));
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  };

  return useQuery("updateAvailability", updateAvailability, { enabled: false });
};
