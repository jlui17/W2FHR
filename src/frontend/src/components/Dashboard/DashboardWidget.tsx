import AvailabilityForm from "../AvailabilityForm";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";
import Header from "./components/Header";

export const DashboardWidget = () => {
  return (
    <div className="h-screen w-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-screen-md py-6">
        <AvailabilityForm />
        <UpcomingShifts />
        <Timesheet />
      </div>
    </div>
  );
};
