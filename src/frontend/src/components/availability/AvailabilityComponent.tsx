import axios from "axios";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { Availability, BASE_API_ENDPOINT } from "../../helpers/API_CONSTANTS";
import { AvailabilityWidget } from "./AvailabilityWidget";

const useGetAvailabilityByEmployeeId = (employeeId: string) => {
  return useQuery(["getAvailabilityByEmployeeId"], async () => {
    const employeeAvailabilityEndpoint = `${BASE_API_ENDPOINT}/availability/${employeeId}`;
    const { data } = await axios.get(employeeAvailabilityEndpoint);

    return data;
  });
};

const AvailabilityRequestHandler = () => {
  // const { data, isFetching } = useGetAvailabilityByEmployeeId("w2fnm170007");

  // const employeeAvailability: Availability = data;

  const isFetching = false;
  const [availability, setAvailability] = useState<Availability>({
    Day1: false,
    Day2: true,
    Day3: true,
    Day4: false,
  });
  console.log(availability);

  return (
    <AvailabilityWidget
      isLoading={isFetching}
      availability={availability}
      setAvailability={setAvailability}
    />
  );
};

export const AvailabilityComponent = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AvailabilityRequestHandler />
    </QueryClientProvider>
  );
};
