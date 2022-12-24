import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";

interface AuthenticationWidgetProps {
  email: string;
  password: string;
  isLoading: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const AuthenticationWidget = ({
  email,
  password,
  isLoading,
  handleChange,
  onSubmit,
}: AuthenticationWidgetProps) => {
  return isLoading ? (
    <CircularProgress />
  ) : (
    <div
      style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}
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
              />
            }
          />
        </FormGroup>
      </FormControl>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
};
