import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ROUTES } from "../common/constants";
import Header from "@/components/Dashboard/components/Header";
import Availability from "@/components/AvailabilityForm";
import UpcomingShifts from "@/components/UpcomingShifts";
import Timesheet from "@/components/Timesheet";
import Scheduling from "@/components/Scheduling";
import Schedule from "@/components/Schedule";
import EditableDataTable from "@/components/EditableDataTable";

export const Dashboard = () => {
  const { isLoggedIn, hasAccessToFeature } = useContext(AuthenticationContext);
  if (!isLoggedIn()) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return (
    <div className="h-full w-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex h-full min-h-screen max-w-screen-md flex-col content-start items-center justify-start gap-x-10 gap-y-6 p-6 lg:grid lg:max-w-screen-lg lg:grid-cols-2 lg:items-start lg:justify-center">
        {/*<Availability />*/}
        {/*<UpcomingShifts />*/}
        {/*<Timesheet />*/}
        {hasAccessToFeature("scheduling") && <Scheduling />}
        {/*{!hasAccessToFeature("scheduling") &&*/}
        {/*  hasAccessToFeature("schedule") && <Schedule />}*/}
        <EditableDataTable />
      </div>
    </div>
  );
};
