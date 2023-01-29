import { lazy, Suspense, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { ROUTES } from "../common/constants";

const DashboardWidget = lazy(() =>
  import("./DashboardWidget").then((module) => ({
    default: module.DashboardWidget,
  }))
);

const DashboardController = () => {
  const { isLoggedIn } = useContext(AuthenticationContext);

  return isLoggedIn() ? (
    <Suspense fallback={null}>
      <DashboardWidget />
    </Suspense>
  ) : (
    <Navigate to={ROUTES.LOGIN} />
  );
};

export const Dashboard = () => {
  return <DashboardController />;
};
