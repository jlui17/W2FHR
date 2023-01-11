import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";

interface PasswordFieldProps {
  password: string;
  showPassword: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onShowPassword: () => void;
}

export const PasswordField = ({
  password,
  showPassword,
  handleChange,
  onShowPassword,
}: PasswordFieldProps) => {
  return (
    <TextField
      label="Password"
      variant="outlined"
      onChange={handleChange}
      name="password"
      value={password}
      type={showPassword ? "text" : "password"}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={onShowPassword}>
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
