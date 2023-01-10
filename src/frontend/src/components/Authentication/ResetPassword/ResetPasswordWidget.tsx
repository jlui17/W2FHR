import { Button, TextField } from "@mui/material";
import { AlertInfo, displayAlert } from "../../common/Alerts";
import { AuthWidget } from "../AuthWidget";
import { ResetPasswordStep } from "./ResetPasswordController";

interface ResetPassowrdWidgetProps {
  isLoading: boolean;
  email: string;
  newPassword: string;
  alert: AlertInfo | null;
  step: ResetPasswordStep;
  goToVerifyingStep: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetNewPassword: () => void;
  closeAlert: () => void;
}

export const ResetPassowrdWidget = ({
  isLoading,
  email,
  newPassword,
  alert,
  handleChange,
  onSetNewPassword,
  closeAlert,
  step,
  goToVerifyingStep,
}: ResetPassowrdWidgetProps) => {
  return (
    <AuthWidget>
      {displayAlert(alert, closeAlert)}
      <h1 className="mx-auto text-2xl">Reset Password</h1>
      {step === ResetPasswordStep.ENTER_EMAIL && (
        <Step1
          email={email}
          handleChange={handleChange}
          goToVerifyingStep={goToVerifyingStep}
        />
      )}
      {step === ResetPasswordStep.ENTER_NEW_PASSWORD && (
        <Step2
          newPassword={newPassword}
          handleChange={handleChange}
          onSetNewPassword={onSetNewPassword}
        />
      )}
    </AuthWidget>
  );
};

const Step1 = ({
  email,
  handleChange,
  goToVerifyingStep,
}: {
  email: ResetPassowrdWidgetProps["email"];
  handleChange: ResetPassowrdWidgetProps["handleChange"];
  goToVerifyingStep: ResetPassowrdWidgetProps["goToVerifyingStep"];
}) => {
  return (
    <>
      <p>Enter your email to reset your password.</p>
      <TextField
        variant="outlined"
        label="Email"
        name="email"
        value={email}
        onChange={handleChange}
      />
      <Button variant="contained" onClick={goToVerifyingStep}>
        Reset Password
      </Button>
    </>
  );
};

const Step2 = ({
  newPassword,
  handleChange,
  onSetNewPassword,
}: {
  newPassword: ResetPassowrdWidgetProps["newPassword"];
  handleChange: ResetPassowrdWidgetProps["handleChange"];
  onSetNewPassword: ResetPassowrdWidgetProps["onSetNewPassword"];
}) => {
  return (
    <>
      <p>Enter your new password.</p>
      <TextField
        variant="outlined"
        label="New Password"
        name="newPassword"
        value={newPassword}
        onChange={handleChange}
      />
      <Button variant="contained" onClick={onSetNewPassword}>
        Set New Password
      </Button>
    </>
  );
};
