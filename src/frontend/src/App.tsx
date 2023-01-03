import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthenticationForm from "./components/AuthenticationForm";
import AvailabilityForm from "./components/AvailabilityForm";
import Timesheet from "./components/Timesheet";
import UpcomingShifts from "./components/UpcomingShifts";

const Dashboard = () => {
  return (
    <div>
      <AvailabilityForm />
      <UpcomingShifts />
      <Timesheet />
    </div>
  );
};

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthenticationForm />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </StyledEngineProvider>
  );
}

export default App;
