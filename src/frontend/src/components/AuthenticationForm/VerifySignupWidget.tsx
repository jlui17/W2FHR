import { Button, TextField } from "@mui/material";
import { AlertInfo, displayAlert } from "../common/Alerts";

interface VerifySignupWidgetProps {
  isLoading: boolean;
  verificationCode: string;
  onConfirmAccount: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  alert: AlertInfo | null;
  closeAlert: () => void;
}

export const ConfirmAccountWidget = ({
  isLoading,
  verificationCode,
  onConfirmAccount,
  handleChange,
  alert,
  closeAlert,
}: VerifySignupWidgetProps) => {
  return (
    <>
      {displayAlert(alert, closeAlert)}
      <div className="flex flex-col justify-center align-middle">
        <p className="break-normal">
          A verification code has been sent to your email. Please check and
          enter it here to complete registration.
        </p>
        <TextField
          className="mb-4"
          variant="outlined"
          name="verificationCode"
          label="Verification Code"
          value={verificationCode}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Button
          variant="contained"
          onClick={onConfirmAccount}
          disabled={isLoading}
        >
          Verify
        </Button>
      </div>
    </>
  );
};
