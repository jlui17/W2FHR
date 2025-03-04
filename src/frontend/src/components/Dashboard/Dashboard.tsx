import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ROUTES, TOAST } from "../common/constants";
import Header from "@/components/Dashboard/components/Header";
import Availability from "@/components/AvailabilityForm";
import UpcomingShifts from "@/components/UpcomingShifts";
import Timesheet from "@/components/Timesheet";
import Scheduling from "@/components/Scheduling";
import Schedule from "@/components/Schedule";
import NewSchedule from "@/components/NewSchedule";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const DashboardQueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error): void => {
      toast.error(TOAST.HEADERS.ERROR, {
        description: error.message,
        duration: TOAST.DURATIONS.ERROR,
      });
    },
  }),
});

export const Dashboard = () => {
  const { isLoggedIn, hasAccessToFeature } = useContext(AuthenticationContext);
  if (!isLoggedIn()) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return (
    <div className="h-full w-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex h-full min-h-screen max-w-screen-md flex-col content-start items-center justify-start gap-x-10 gap-y-6 p-6 lg:grid lg:max-w-screen-xl lg:grid-cols-2 lg:items-start lg:justify-center">
        <QueryClientProvider client={DashboardQueryClient}>
          <Availability />
          <UpcomingShifts />
          <Timesheet />
          {hasAccessToFeature("scheduling") && <Scheduling />}
          {!hasAccessToFeature("scheduling") &&
            hasAccessToFeature("schedule") && <Schedule />}
          <NewSchedule />
        </QueryClientProvider>
      </div>
    </div>
  );
};
