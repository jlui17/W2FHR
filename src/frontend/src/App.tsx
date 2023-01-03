import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthenticationForm from "./components/AuthenticationForm";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
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
