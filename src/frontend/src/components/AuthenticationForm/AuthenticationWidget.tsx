import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";

interface AuthenticationWidgetProps {
  email: string;
  password: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  refetch: () => void;
}

export const AuthenticationWidget = ({
  email,
  password,
  handleChange,
  refetch,
}: AuthenticationWidgetProps) => {
  return (
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
      <Button onClick={refetch}>Submit</Button>
    </div>
  );
};
