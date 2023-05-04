import { Button, TextField } from "@mui/material";
import { AuthWidget } from "../AuthWidget";

interface VerifySignupWidgetProps {
  isLoading: boolean;
  verificationCode: string;
  onVerify: () => void;
  onResendVerificationCode: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showResendVerificationCode: boolean;
  canSubmit: boolean;
}

export const VerifyWidget = ({
  isLoading,
  verificationCode,
  onVerify,
  onResendVerificationCode,
  handleChange,
  showResendVerificationCode,
  canSubmit,
}: VerifySignupWidgetProps) => {
  return (
    <AuthWidget>
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
        {showResendVerificationCode ? (
          <Button
            className="mb-4 inline-block w-fit text-xs"
            variant="text"
            onClick={onResendVerificationCode}
            disabled={isLoading}
          >
            Resend verification code
          </Button>
        ) : null}
      </div>
      <Button
        variant="contained"
        onClick={onVerify}
        disabled={isLoading || !canSubmit}
      >
        Verify
      </Button>
    </AuthWidget>
  );
};
