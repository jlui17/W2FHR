import { QueryClient, QueryClientProvider } from "react-query";
import ExpandableCard from "../common/ExpandableCard";
import { TimesheetController } from "./TimesheetController";

export const Timesheet = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <ExpandableCard headerTitle="Shift History">
      <QueryClientProvider client={queryClient}>
        <TimesheetController />
      </QueryClientProvider>
    </ExpandableCard>
  );
};
