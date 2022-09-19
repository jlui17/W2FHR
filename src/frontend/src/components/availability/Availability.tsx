import { QueryClient, QueryClientProvider } from "react-query";
import { AvailabilityWidget } from "./AvailabilityWidget";

export const Availability = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      Availability <AvailabilityWidget />
    </QueryClientProvider>
  );
};
