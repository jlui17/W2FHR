import { QueryClient, QueryClientProvider } from "react-query";
import ExpandableCard from "../common/ExpandableCard";
import { TimesheetController } from "./TimesheetController";

export const Timesheet = (): JSX.Element => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ExpandableCard
        className="my-6 flex w-full max-w-screen-md flex-col items-center justify-center"
        headerTitle="Shift History"
      >
        <TimesheetController />
      </ExpandableCard>
    </QueryClientProvider>
  );
};
