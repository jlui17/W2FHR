import { Button, TextField } from "@mui/material";
import { AlertInfo, displayAlert } from "../../common/Alerts";
import { AuthWidget } from "../AuthWidget";

interface VerifySignupWidgetProps {
  isLoading: boolean;
  verificationCode: string;
  onConfirmAccount: () => void;
  onResendVerificationCode: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  alert: AlertInfo | null;
  closeAlert: () => void;
}

export const ConfirmAccountWidget = ({
  isLoading,
  verificationCode,
  onConfirmAccount,
  onResendVerificationCode,
  handleChange,
  alert,
  closeAlert,
}: VerifySignupWidgetProps) => {
  return (
    <AuthWidget>
      {displayAlert(alert, closeAlert)}
      <p className="break-normal">
        A verification code has been sent to your email. Please check and enter
        it here to move on.
      </p>
      <div className="flex flex-col">
        <TextField
          variant="outlined"
          name="verificationCode"
          label="Verification Code"
          value={verificationCode}
          onChange={handleChange}
          disabled={isLoading}
        />
        <br />
        <Button
          className="mb-4 inline-block w-fit text-xs"
          variant="text"
          onClick={onResendVerificationCode}
          disabled={isLoading}
        >
          Resend verification code
        </Button>
      </div>
      <Button
        variant="contained"
        onClick={onConfirmAccount}
        disabled={isLoading}
      >
        Verify
      </Button>
    </AuthWidget>
  );
};
