import { Button, TextField } from "@mui/material";
import { AlertInfo, displayAlert } from "../common/Alerts";

interface VerifySignupWidgetProps {
  isLoading: boolean;
  verificationCode: string;
  onVerifySignup: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  alert: AlertInfo | null;
  closeAlert: () => void;
}

export const VerifySignupWidget = ({
  isLoading,
  verificationCode,
  onVerifySignup,
  handleChange,
  alert,
  closeAlert,
}: VerifySignupWidgetProps) => {
  return (
    <>
      {displayAlert(alert, closeAlert)}
      <div className="flex flex-col justify-center align-middle">
        <p>Enter your verification code</p>
        <TextField
          variant="outlined"
          name="verificationCode"
          value={verificationCode}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Button onClick={onVerifySignup} disabled={isLoading}>
          Verify
        </Button>
      </div>
    </>
  );
};
