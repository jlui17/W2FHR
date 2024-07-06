import Availability from "../AvailabilityForm";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";
import Header from "./components/Header";

export const DashboardWidget = () => {
  return (
    <div className="h-full w-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex h-full min-h-screen max-w-screen-md flex-col content-start items-center gap-x-10 justify-start p-6 sm:block md:grid md:max-w-screen-md md:grid-cols-2 md:items-start md:justify-center">
        <Availability />
        <UpcomingShifts />
        <Timesheet />
      </div>
    </div>
  );
};
