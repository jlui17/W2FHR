import Availability from "../AvailabilityForm";
import Schedule from "../Schedule";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";
import Header from "./components/Header";

export const DashboardWidget = () => {
  return (
    <div className="h-full w-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex h-full min-h-screen max-w-screen-md flex-col content-start items-center justify-start gap-x-10 gap-y-6 p-6 lg:grid lg:max-w-screen-lg lg:grid-cols-2 lg:items-start lg:justify-center">
        <Availability />
        <UpcomingShifts />
        <Timesheet />
        <Schedule />
      </div>
    </div>
  );
};
