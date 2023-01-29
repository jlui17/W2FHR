import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ROUTES } from "../common/constants";
import { DashboardWidget } from "./DashboardWidget";

const DashboardController = () => {
  const { isLoggedIn } = useContext(AuthenticationContext);

  return isLoggedIn() ? <DashboardWidget /> : <Navigate to={ROUTES.LOGIN} />;
};

export const Dashboard = () => {
  return <DashboardController />;
};
