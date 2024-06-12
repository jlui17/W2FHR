import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { AuthWidget } from "../AuthWidget";
import { PasswordField } from "../common/PasswordField";

export const LoginSignupWidget = (p: {
  email: string;
  password: string;
  isLoading: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSignup: () => void;
  onLogin: () => void;
  onResetPassword: () => void;
  showPassword: boolean;
  onShowPassword: () => void;
  canSubmit: boolean;
  onStayLoggedIn: (event: React.ChangeEvent<HTMLInputElement>) => void;
  stayLoggedIn: boolean;
}) => {
  return (
    <div className="flex h-screen w-screen place-items-center">
      <AuthWidget>
        <h1 className="mx-auto mb-4 inline-block text-2xl">Employee Portal</h1>
        <TextField
          className="mb-4"
          variant="outlined"
          label="Email"
          name="email"
          value={p.email}
          onChange={p.handleChange}
          disabled={p.isLoading}
        />
        <PasswordField
          password={p.password}
          showPassword={p.showPassword}
          handleChange={p.handleChange}
          onShowPassword={p.onShowPassword}
          disabled={p.isLoading}
        />
        <div className="flex w-auto items-center justify-between">
          <FormControlLabel
            control={
              <Checkbox
                checked={p.stayLoggedIn}
                disabled={p.isLoading}
                name="day1"
                onChange={p.onStayLoggedIn}
              />
            }
            className="mb-4 w-fit text-xs"
            label="Stay Logged In?"
          />
          <Button
            className="mb-4 w-fit text-xs"
            variant="text"
            onClick={p.onResetPassword}
          >
            Forgot password?
          </Button>
        </div>
        <div className="flex w-auto items-center justify-evenly">
          <Button
            className="mr-4 w-full"
            variant="contained"
            disabled={p.isLoading || !p.canSubmit}
            onClick={p.onLogin}
          >
            Login
          </Button>
          <Button
            className="w-full"
            variant="contained"
            onClick={p.onSignup}
            disabled={p.isLoading || !p.canSubmit}
          >
            Sign up
          </Button>
        </div>
      </AuthWidget>
    </div>
  );
};
