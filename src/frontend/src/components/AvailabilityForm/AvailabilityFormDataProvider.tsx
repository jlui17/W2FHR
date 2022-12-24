import axios from "axios";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { getAvailabilityApiUrlForEmployee } from "../common/ApiUrlUtil";
import { ERROR_MESSAGSES } from "../common/constants";
import { AvailabilityFormWidget } from "./AvailabilityFormWidget";

interface Day {
  isAvailable: boolean;
  date: string;
}

export interface AvailabilityData {
  day1: Day;
  day2: Day;
  day3: Day;
  day4: Day;
  canUpdate: boolean;
}

const isAvailabilityData = (data: any): data is AvailabilityData => {
  return (
    data.day1 && data.day2 && data.day3 && data.day4 && data.canUpdate != null
  );
};

const AvailabilityFormDataProvider = (props: any): JSX.Element => {
  const EMPTY_DATA: AvailabilityData = {
    day1: { isAvailable: false, date: "" },
    day2: { isAvailable: false, date: "" },
    day3: { isAvailable: false, date: "" },
    day4: { isAvailable: false, date: "" },
    canUpdate: false,
  };

  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityData>(EMPTY_DATA);

  const employeeId = "w2fnm150009";

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

  const updateAvailability = async (): Promise<void> => {
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

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, checked } = event.target;
    const newAvailabilityData = { ...availabilityData };
    switch (name) {
      case "day1":
        newAvailabilityData.day1.isAvailable = checked;
        break;
      case "day2":
        newAvailabilityData.day2.isAvailable = checked;
        break;
      case "day3":
        newAvailabilityData.day3.isAvailable = checked;
        break;
      case "day4":
        newAvailabilityData.day4.isAvailable = checked;
        break;
      default:
        break;
    }
    setAvailabilityData(newAvailabilityData);
  };

  const { isLoading } = useQuery<void>("availability", fetchAvailability);

  if (isLoading) {
    return (
      <AvailabilityFormWidget
        isLoading
        availabilityData={EMPTY_DATA}
        handleAvailabilityChange={handleAvailabilityChange}
        updateAvailability={updateAvailability}
      />
    );
  }

  return (
    <AvailabilityFormWidget
      isLoading={false}
      availabilityData={availabilityData}
      handleAvailabilityChange={handleAvailabilityChange}
      updateAvailability={updateAvailability}
    />
  );
};

export const AvailabilityForm = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AvailabilityFormDataProvider />
    </QueryClientProvider>
  );
};
