import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authentication from "./components/Authentication";
import { AuthenticationContextProvider } from "./components/AuthenticationContextProvider";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        <AuthenticationContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Authentication />} />
              <Route path="dashboard" element={<Dashboard />} />
            </Routes>
          </BrowserRouter>
        </AuthenticationContextProvider>
      </div>
    </StyledEngineProvider>
  );
}

export default App;
