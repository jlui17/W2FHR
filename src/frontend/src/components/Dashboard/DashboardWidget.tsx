import AvailabilityForm from "../AvailabilityForm";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";
import Header from "./components/Header";

export const DashboardWidget = () => {
  return (
    <div className="h-screen w-screen">
      <Header />
      <div>
        <AvailabilityForm />
        <UpcomingShifts />
        <Timesheet />
      </div>
    </div>
  );
};
