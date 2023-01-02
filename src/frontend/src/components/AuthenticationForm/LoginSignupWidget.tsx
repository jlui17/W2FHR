import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import { AlertInfo, displayAlert } from "../common/Alerts";

interface LoginSignupWidgetProps {
  email: string;
  password: string;
  isLoading: boolean;
  alert: AlertInfo | null;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSignup: () => void;
  closeAlert: () => void;
}

export const LoginSignupWidget = ({
  email,
  password,
  isLoading,
  alert,
  handleChange,
  onSignup,
  closeAlert,
}: LoginSignupWidgetProps) => {
  return (
    <>
      {displayAlert(alert, closeAlert)}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "300px",
        }}
      >
        <FormControl>
          <FormGroup>
            <FormControlLabel
              label="email"
              labelPlacement="start"
              control={
                <TextField
                  variant="outlined"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              }
            />
            <FormControlLabel
              label="password"
              labelPlacement="start"
              control={
                <TextField
                  variant="outlined"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              }
            />
          </FormGroup>
        </FormControl>
        <Button onClick={onSignup} disabled={isLoading}>
          Signup
        </Button>
      </div>
    </>
  );
};
