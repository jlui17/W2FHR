import { CodeMismatchException } from "@aws-sdk/client-cognito-identity-provider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertInfo, AlertType } from "../../common/Alerts";
import {
  ERROR_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
} from "../../common/constants";
import { VerifyWidget } from "../common/VerifyWidget";
import {
  confirmPasswordReset,
  initiatePasswordReset,
} from "../helpers/authentication";
import { ResetPassowrdWidget } from "./ResetPasswordWidget";

export enum ResetPasswordStep {
  ENTER_EMAIL = "ENTER_EMAIL",
  VERIFY_CODE = "VERIFY_CODE",
  ENTER_NEW_PASSWORD = "ENTER_NEW_PASSWORD",
}

const ResetPasswordController = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const [step, setStep] = useState(ResetPasswordStep.ENTER_EMAIL);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setNewPassword(value);
        break;
      case "verificationCode":
        setVerificationCode(value);
        break;
      default:
        break;
    }
  };

  const goToVerifyingStep = async () => {
    setIsLoading(true);
    try {
      await initiatePasswordReset(email);
      setStep(ResetPasswordStep.VERIFY_CODE);
    } catch (err) {
      if (err instanceof Error) {
        setAlert({
          type: AlertType.ERROR,
          message: err.message,
        });
      }
    }
    setIsLoading(false);
  };

  const onSetNewPassword = async () => {
    setIsLoading(true);
    try {
      await confirmPasswordReset(email, newPassword, verificationCode);
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_PASSWORD_RESET,
      });
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1000);
      return;
    } catch (err) {
      console.error(`Error while resetting password:\n${err}`);
      if (err instanceof Error) {
        setAlert({
          type: AlertType.ERROR,
          message: err.message,
        });
      } else {
        setAlert({
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        });
      }

      if (err instanceof CodeMismatchException) {
        setNewPassword("");
        setStep(ResetPasswordStep.VERIFY_CODE);
      }
    }
    setIsLoading(false);
  };

  if (step === ResetPasswordStep.VERIFY_CODE) {
    return (
      <VerifyWidget
        isLoading={isLoading}
        verificationCode={verificationCode}
        alert={alert}
        closeAlert={() => setAlert(null)}
        onVerify={() => setStep(ResetPasswordStep.ENTER_NEW_PASSWORD)}
        handleChange={handleChange}
        onResendVerificationCode={() => {}}
        showResendVerificationCode={false}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen place-items-center">
      <ResetPassowrdWidget
        isLoading={isLoading}
        email={email}
        newPassword={newPassword}
        alert={alert}
        closeAlert={() => setAlert(null)}
        onSetNewPassword={onSetNewPassword}
        handleChange={handleChange}
        step={step}
        goToVerifyingStep={goToVerifyingStep}
        showPassword={showPassword}
        onShowPassword={() => setShowPassword(!showPassword)}
      />
    </div>
  );
};

export const ResetPassword = () => {
  return <ResetPasswordController />;
};
