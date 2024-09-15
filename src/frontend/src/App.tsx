import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Authentication/Login";
import ResetPassword from "./components/Authentication/ResetPassword";
import SignUp from "./components/Authentication/SignUp";
import { AuthenticationContextProvider } from "./components/AuthenticationContextProvider";
import { ROUTES } from "./components/common/constants";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <AuthenticationContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<SignUp />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthenticationContextProvider>
  );
}

export default App;
