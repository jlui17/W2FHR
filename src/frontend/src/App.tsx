import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginSignup from "./components/Authentication/LoginSignup";
import ResetPassword from "./components/Authentication/ResetPassword";
import { AuthenticationContextProvider } from "./components/AuthenticationContextProvider";
import { ROUTES } from "./components/common/constants";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        <AuthenticationContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginSignup />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            </Routes>
          </BrowserRouter>
        </AuthenticationContextProvider>
      </div>
    </StyledEngineProvider>
  );
}

export default App;
