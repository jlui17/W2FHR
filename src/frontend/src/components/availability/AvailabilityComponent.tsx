import axios from "axios";
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
  const { data, isFetching } = useGetAvailabilityByEmployeeId("w2fnm170007");

  const employeeAvailability: Availability = data;

  return (
    <AvailabilityWidget
      initialAvailability={employeeAvailability}
      isLoading={isFetching}
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
