import "./App.css";
import AvailabilityForm from "./components/AvailabilityForm";
import Timesheet from "./components/Timesheet";
import UpcomingShifts from "./components/UpcomingShifts";

function App() {
  return (
    <div className="App">
      <AvailabilityForm />
      <UpcomingShifts />
      <Timesheet />
    </div>
  );
}

export default App;
