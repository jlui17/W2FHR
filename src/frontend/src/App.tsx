import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginSignup from "./components/Authentication/LoginSignup";
import ResetPassword from "./components/Authentication/ResetPassword";
import { AuthenticationContextProvider } from "./components/AuthenticationContextProvider";
import { AlertContextProvider } from "./components/common/Alerts";
import { ROUTES } from "./components/common/constants";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <AuthenticationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginSignup />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            </Routes>
          </BrowserRouter>
        </AlertContextProvider>
      </AuthenticationContextProvider>
    </StyledEngineProvider>
  );
}

export default App;
