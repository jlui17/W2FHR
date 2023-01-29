import AvailabilityForm from "../AvailabilityForm";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";

export const DashboardWidget = () => {
  return (
    <div>
      <AvailabilityForm />
      <UpcomingShifts />
      <Timesheet />
    </div>
  );
};
