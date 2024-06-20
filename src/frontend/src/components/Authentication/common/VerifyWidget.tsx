import { Button } from "@/components/ui/button";
import { TextField } from "@mui/material";
import { AuthWidget } from "../AuthWidget";

interface VerifySignupWidgetProps {
  isLoading: boolean;
  verificationCode: string;
  onVerify: () => void;
  onResendVerificationCode: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showResendVerificationCode: boolean;
  canSubmit: boolean;
  goBack: () => void;
}

export const VerifyWidget = ({
  isLoading,
  verificationCode,
  onVerify,
  onResendVerificationCode,
  handleChange,
  showResendVerificationCode,
  canSubmit,
  goBack,
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
            variant="link"
            onClick={onResendVerificationCode}
            disabled={isLoading}
          >
            Resend verification code
          </Button>
        ) : null}
      </div>
      <div className="flex w-auto items-center justify-evenly">
        <Button
          onClick={onVerify}
          disabled={isLoading || !canSubmit}
          className="mr-4 w-full"
        >
          Verify
        </Button>
        <Button
          variant="secondary"
          disabled={isLoading}
          onClick={goBack}
          className="w-full"
        >
          Back
        </Button>
      </div>
    </AuthWidget>
  );
};
