import React, { useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { AlertInfo, AlertType } from "../common/Alerts";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../common/constants";
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

const AvailabilityFormController = (props: any): JSX.Element => {
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityData>(EMPTY_DATA);
  const { authSession } = useContext(AuthenticationContext);
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const {
    isFetching: isLoadingGet,
    error: getError,
    isRefetchError: errorOnRefetchGet,
  } = useAvailabilityData({
    setAvailabilityData: setAvailabilityData,
    idToken: authSession?.IdToken || "",
  });
  const {
    isFetching: isLoadingUpdate,
    refetch: updateAvailability,
    error: updateError,
    isRefetchError: errorOnRefetchUpdate,
    isSuccess: updateSucessful,
  } = useUpdateAvailability({
    availabilityData: availabilityData,
    setAvailabilityData: setAvailabilityData,
    idToken: authSession?.IdToken || "",
  });

  useEffect(() => {
    setAlert(() => {
      const error =
        getError != null ? getError : updateError != null ? updateError : null;
      if (error) {
        console.error(`Error in AvailabilityForm:\n${error}`);
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        };
        if (error instanceof Error) {
          errorAlert.message = error.message;
        }
        return errorAlert;
      }

      if (updateSucessful) {
        return {
          type: AlertType.SUCCESS,
          message: SUCCESS_MESSAGES.AVAILABILITY.SUCESSFUL_UPDATE,
        };
      }

      return null;
    });
  }, [
    getError,
    updateError,
    updateSucessful,
    errorOnRefetchGet,
    errorOnRefetchUpdate,
  ]);

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
      alert={alert}
      closeAlert={() => setAlert(null)}
    />
  );
};

export const AvailabilityForm = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AvailabilityFormController />
    </QueryClientProvider>
  );
};
