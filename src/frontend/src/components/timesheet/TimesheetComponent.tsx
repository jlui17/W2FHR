import axios from "axios";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import {
  BASE_API_ENDPOINT,
  EmployeeShift,
  QUERY_CLIENT_DEFAULT_OPTIONS,
} from "../../helpers/API_CONSTANTS";
import { TimesheetWidget } from "./TimesheetWidget";

const TimesheetRequestHandler = () => {
  const [timesheet, setTimesheet] = useState<EmployeeShift[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("w2fnm170007");

  const { refetch: refreshTimesheet, isFetching } = useQuery(
    ["getAvailabilityByEmployeeId"],
    async () => {
      const employeeAvailabilityEndpoint = `${BASE_API_ENDPOINT}/timesheet/${employeeId}`;
      const { data: availability } = await axios.get(
        employeeAvailabilityEndpoint
      );

      return availability;
    },
    { onSuccess: setTimesheet }
  );

  return <TimesheetWidget isLoading={isFetching} timesheet={timesheet} />;
};

export const TimesheetComponent = () => {
  const queryClient = new QueryClient(QUERY_CLIENT_DEFAULT_OPTIONS);
  return (
    <QueryClientProvider client={queryClient}>
      <TimesheetRequestHandler />
    </QueryClientProvider>
  );
};
