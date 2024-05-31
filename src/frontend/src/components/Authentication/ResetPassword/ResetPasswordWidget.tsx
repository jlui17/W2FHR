import { Button, TextField } from "@mui/material";
import { AuthWidget } from "../AuthWidget";
import { PasswordField } from "../common/PasswordField";
import { ResetPasswordStep } from "./ResetPasswordController";

interface ResetPassowrdWidgetProps {
  isLoading: boolean;
  email: string;
  newPassword: string;
  step: ResetPasswordStep;
  goToVerifyingStep: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetNewPassword: () => void;
  showPassword: boolean;
  onShowPassword: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  goBackToVerifyCode: () => void;
}

export const ResetPassowrdWidget = ({
  isLoading,
  email,
  newPassword,
  handleChange,
  onSetNewPassword,
  step,
  goToVerifyingStep,
  showPassword,
  onShowPassword,
  onCancel,
  canSubmit,
  goBackToVerifyCode,
}: ResetPassowrdWidgetProps) => {
  return (
    <AuthWidget>
      <h1 className="mx-auto text-2xl">Reset Password</h1>
      {step === ResetPasswordStep.ENTER_EMAIL && (
        <Step1
          email={email}
          handleChange={handleChange}
          goToVerifyingStep={goToVerifyingStep}
          isLoading={isLoading}
          onCancel={onCancel}
          canSubmit={canSubmit}
        />
      )}
      {step === ResetPasswordStep.ENTER_NEW_PASSWORD && (
        <Step2
          newPassword={newPassword}
          handleChange={handleChange}
          onSetNewPassword={onSetNewPassword}
          showPassword={showPassword}
          onShowPassword={onShowPassword}
          isLoading={isLoading}
          canSubmit={canSubmit}
          goBackToVerifyCode={goBackToVerifyCode}
        />
      )}
    </AuthWidget>
  );
};

const Step1 = ({
  email,
  handleChange,
  goToVerifyingStep,
  isLoading,
  onCancel,
  canSubmit,
}: {
  email: ResetPassowrdWidgetProps["email"];
  handleChange: ResetPassowrdWidgetProps["handleChange"];
  goToVerifyingStep: ResetPassowrdWidgetProps["goToVerifyingStep"];
  isLoading: ResetPassowrdWidgetProps["isLoading"];
  onCancel: ResetPassowrdWidgetProps["onCancel"];
  canSubmit: ResetPassowrdWidgetProps["canSubmit"];
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
        disabled={isLoading}
      />
      <div className="flex w-auto items-center justify-evenly">
        <Button
          variant="contained"
          onClick={goToVerifyingStep}
          disabled={isLoading || !canSubmit}
          className="mr-4 w-full"
        >
          Reset Password
        </Button>
        <Button
          variant="outlined"
          disabled={isLoading}
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </>
  );
};

const Step2 = ({
  newPassword,
  handleChange,
  onSetNewPassword,
  showPassword,
  onShowPassword,
  isLoading,
  canSubmit,
  goBackToVerifyCode,
}: {
  newPassword: ResetPassowrdWidgetProps["newPassword"];
  handleChange: ResetPassowrdWidgetProps["handleChange"];
  onSetNewPassword: ResetPassowrdWidgetProps["onSetNewPassword"];
  showPassword: ResetPassowrdWidgetProps["showPassword"];
  onShowPassword: ResetPassowrdWidgetProps["onShowPassword"];
  isLoading: ResetPassowrdWidgetProps["isLoading"];
  canSubmit: ResetPassowrdWidgetProps["canSubmit"];
  goBackToVerifyCode: ResetPassowrdWidgetProps["goBackToVerifyCode"];
}) => {
  return (
    <>
      <p>Enter your new password.</p>
      <PasswordField
        password={newPassword}
        handleChange={handleChange}
        showPassword={showPassword}
        onShowPassword={onShowPassword}
        disabled={isLoading}
      />
      <div className="flex w-auto items-center justify-evenly">
        <Button
          variant="contained"
          onClick={onSetNewPassword}
          disabled={isLoading || !canSubmit}
          className="mr-4 w-full"
        >
          Reset Password
        </Button>
        <Button
          variant="outlined"
          disabled={isLoading}
          onClick={goBackToVerifyCode}
          className="w-full"
        >
          Back
        </Button>
      </div>
    </>
  );
};
