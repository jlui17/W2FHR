import { CssBaseline, StyledEngineProvider } from "@mui/material";
import "./App.css";
import AuthenticationForm from "./components/AuthenticationForm";
import AvailabilityForm from "./components/AvailabilityForm";
import Timesheet from "./components/Timesheet";
import UpcomingShifts from "./components/UpcomingShifts";

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <div className="App">
        <AuthenticationForm />
        <AvailabilityForm />
        <UpcomingShifts />
        <Timesheet />
      </div>
    </StyledEngineProvider>
  );
}

export default App;
