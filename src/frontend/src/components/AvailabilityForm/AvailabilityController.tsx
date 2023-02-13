import React, { useContext, useState } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "react-query";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../common/Alerts";
import { ERROR_MESSAGES } from "../common/constants";
import { AvailabilityFormWidget } from "./AvailabilityFormWidget";
import { useAvailabilityData, useUpdateAvailability } from "./helpers/hooks";

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

const EMPTY_DATA: AvailabilityData = {
  day1: { isAvailable: false, date: "" },
  day2: { isAvailable: false, date: "" },
  day3: { isAvailable: false, date: "" },
  day4: { isAvailable: false, date: "" },
  canUpdate: false,
};

const AvailabilityFormController = (): JSX.Element => {
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityData>(EMPTY_DATA);
  const { getAuthSession } = useContext(AuthenticationContext);
  const { isFetching: isLoadingGet } = useAvailabilityData({
    setAvailabilityData: setAvailabilityData,
    idToken: getAuthSession()?.IdToken || "",
  });
  const { isFetching: isLoadingUpdate, refetch: updateAvailability } =
    useUpdateAvailability({
      availabilityData: availabilityData,
      setAvailabilityData: setAvailabilityData,
      idToken: getAuthSession()?.IdToken || "",
    });

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

  return (
    <AvailabilityFormWidget
      isLoading={isLoadingGet || isLoadingUpdate}
      availabilityData={availabilityData}
      handleAvailabilityChange={handleAvailabilityChange}
      updateAvailability={updateAvailability}
    />
  );
};

export const AvailabilityForm = (): JSX.Element => {
  const { setAlert } = useAlert();

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in AvailabilityForm:\n${error}`);
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
      <AvailabilityFormController />
    </QueryClientProvider>
  );
};
