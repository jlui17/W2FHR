import axios from "axios";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import {
  Availability,
  BASE_API_ENDPOINT,
  QUERY_CLIENT_DEFAULT_OPTIONS,
} from "../../helpers/API_CONSTANTS";
import { AvailabilityWidget } from "./AvailabilityWidget";

const AvailabilityRequestHandler = () => {
  const [availability, setAvailability] = useState<Availability>({
    day1: { isAvailable: false, date: "" },
    day2: { isAvailable: false, date: "" },
    day3: { isAvailable: false, date: "" },
    day4: { isAvailable: false, date: "" },
    canUpdate: false,
  });
  const [employeeId, setEmployeeId] = useState<string>("w2fnm170007");

  const { refetch: refreshAvailability, isFetching: isFetchingGet } = useQuery(
    ["getAvailabilityByEmployeeId"],
    async () => {
      const employeeAvailabilityEndpoint = `${BASE_API_ENDPOINT}/availability/${employeeId}`;
      const { data: availability } = await axios.get(
        employeeAvailabilityEndpoint
      );

      return availability;
    },
    { onSuccess: setAvailability }
  );

  const { refetch: updateAvailability, isFetching: isFetchingUpdate } =
    useQuery(
      ["updateAvailabilityByEmployeeId"],
      async () => {
        const employeeAvailabilityEndpoint = `${BASE_API_ENDPOINT}/availability/${employeeId}`;
        const { data: updatedAvailability } = await axios.post(
          employeeAvailabilityEndpoint,
          availability
        );

        return updatedAvailability;
      },
      { onSuccess: setAvailability, enabled: false }
    );

  const useUpdateAvailabilityByEmployeeId = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    updateAvailability();
  };

  return (
    <AvailabilityWidget
      isLoading={isFetchingGet || isFetchingUpdate}
      availability={availability}
      setAvailability={setAvailability}
      employeeId={employeeId}
      setEmployeeId={setEmployeeId}
      updateEmployeeAvailability={useUpdateAvailabilityByEmployeeId}
      refreshAvailability={refreshAvailability}
    />
  );
};

export const AvailabilityComponent = () => {
  const queryClient = new QueryClient(QUERY_CLIENT_DEFAULT_OPTIONS);
  return (
    <QueryClientProvider client={queryClient}>
      <AvailabilityRequestHandler />
    </QueryClientProvider>
  );
};
