import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ROUTES } from "../common/constants";
import { DashboardWidget } from "./DashboardWidget";
import { ManagerWidget } from "./ManagerDashboard/ManagerWidget";

const DashboardController = () => {
  const { isLoggedIn, isManager } = useContext(AuthenticationContext);

  if (!isLoggedIn()) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return isManager() ? <ManagerWidget /> : <DashboardWidget />;
};

export const Dashboard = () => {
  return <DashboardController />;
};
