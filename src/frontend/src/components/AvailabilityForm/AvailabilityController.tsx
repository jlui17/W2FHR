import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AlertInfo } from "../common/Alerts";
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

const employeeId = "w2fnm150009";

const AvailabilityFormController = (props: any): JSX.Element => {
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityData>(EMPTY_DATA);
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const { isLoading, error: getError } = useAvailabilityData(
    employeeId,
    setAvailabilityData
  );
  const { refetch: updateAvailability, error: updateError } =
    useUpdateAvailability(employeeId, availabilityData, setAvailabilityData);

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
      isLoading={isLoading ? isLoading : false}
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
