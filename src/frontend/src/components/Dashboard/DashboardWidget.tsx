import AvailabilityForm from "../AvailabilityForm";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";
import Header from "./components/Header";

export const DashboardWidget = () => {
  return (
    <div className="h-full w-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex h-full min-h-screen max-w-screen-md flex-col content-start justify-start p-6 sm:block md:flex md:max-w-screen-md md:flex-row md:flex-wrap md:items-start md:justify-evenly">
        <AvailabilityForm />
        <UpcomingShifts />
        <Timesheet />
      </div>
    </div>
  );
};
