import { Button, TextField } from "@mui/material";
import { AuthWidget } from "../AuthWidget";
import { PasswordField } from "../common/PasswordField";

interface LoginSignupWidgetProps {
  email: string;
  password: string;
  isLoading: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSignup: () => void;
  onLogin: () => void;
  onResetPassword: () => void;
  showPassword: boolean;
  onShowPassword: () => void;
}

export const LoginSignupWidget = ({
  email,
  password,
  isLoading,
  handleChange,
  onSignup,
  onLogin,
  onResetPassword,
  showPassword,
  onShowPassword,
}: LoginSignupWidgetProps) => {
  return (
    <div className="flex h-screen w-screen place-items-center">
      <AuthWidget>
        <h1 className="mx-auto mb-4 inline-block text-2xl">Employee Portal</h1>
        <TextField
          className="mb-4"
          variant="outlined"
          label="Email"
          name="email"
          value={email}
          onChange={handleChange}
          disabled={isLoading}
        />
        <PasswordField
          password={password}
          showPassword={showPassword}
          handleChange={handleChange}
          onShowPassword={onShowPassword}
          disabled={isLoading}
        />
        <Button
          className="mb-4 w-fit text-xs"
          variant="text"
          onClick={onResetPassword}
        >
          Forgot password?
        </Button>
        <div className="flex w-auto items-center justify-evenly">
          <Button
            className="mr-4 w-full"
            variant="contained"
            disabled={isLoading}
            onClick={onLogin}
          >
            Login
          </Button>
          <Button
            className="w-full"
            variant="contained"
            onClick={onSignup}
            disabled={isLoading}
          >
            Sign up
          </Button>
        </div>
      </AuthWidget>
    </div>
  );
};
