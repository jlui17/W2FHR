import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import AvailabilityForm from "../AvailabilityForm";
import { ROUTES } from "../common/constants";
import Timesheet from "../Timesheet";
import UpcomingShifts from "../UpcomingShifts";

const DashboardController = () => {
  const { getAuthSession } = useContext(AuthenticationContext);
  const isLoggedin = getAuthSession() !== null;

  return isLoggedin ? (
    <div>
      <AvailabilityForm />
      <UpcomingShifts />
      <Timesheet />
    </div>
  ) : (
    <Navigate to={ROUTES.LOGIN} />
  );
};

export const Dashboard = () => {
  return <DashboardController />;
};
