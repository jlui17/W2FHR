import { QueryClient, QueryClientProvider } from "react-query";
import ExpandableCard from "../common/ExpandableCard";
import { TimesheetDataProvider } from "./TimesheetDataProvider";

export const Timesheet = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <ExpandableCard headerTitle="Shift History">
      <QueryClientProvider client={queryClient}>
        <TimesheetDataProvider />
      </QueryClientProvider>
    </ExpandableCard>
  );
};
