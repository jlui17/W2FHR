import AvailabilityForm from "../AvailabilityForm";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";

const DashboardController = () => {
  return (
    <div>
      <AvailabilityForm />
      <UpcomingShifts />
      <Timesheet />
    </div>
  );
};

export const Dashboard = () => {
  return <DashboardController />;
};
