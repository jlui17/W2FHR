import { Button, TextField } from "@mui/material";
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
      <div className="flex flex-col justify-center align-middle">
        <h1 className="mb-4 inline-block text-lg">
          Sign in to or sign up for an account
        </h1>
        <TextField
          className="mb-4"
          variant="outlined"
          label="Email"
          name="email"
          value={email}
          onChange={handleChange}
          disabled={isLoading}
        />
        <TextField
          variant="outlined"
          label="Password"
          name="password"
          value={password}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Button className="mb-4 w-fit text-xs" variant="text">
          Forgot password?
        </Button>
        <div className="flex w-auto justify-evenly align-middle">
          <Button className="mr-4 w-[100%]" variant="contained">
            Login
          </Button>
          <Button
            className="w-[100%]"
            variant="contained"
            onClick={onSignup}
            disabled={isLoading}
          >
            Sign up
          </Button>
        </div>
      </div>
    </>
  );
};
