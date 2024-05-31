import React, { useContext, useState } from "react";
import { QueryClient, QueryClientProvider, UseQueryResult } from "react-query";
import { useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../AuthenticationContextProvider";
import { AlertType, useAlert } from "../../common/Alerts";
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
  const [step, setStep] = useState(ResetPasswordStep.ENTER_EMAIL);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { getAuthSession } = useContext(AuthenticationContext);

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

  const { mutateAsync: initiateReset } = initiatePasswordReset({
    email,
    onSuccess: () => {
      setStep(ResetPasswordStep.VERIFY_CODE);
      setAlert({
        type: AlertType.SUCCESS,
        message: "Verification code sent. Check your email.",
      });
    },
    onError: (err) => {
      if (err instanceof Error) {
        setAlert({
          type: AlertType.ERROR,
          message: err.message,
        });
      }
    },
  });

  const { mutateAsync: confirmReset } = confirmPasswordReset({
    email,
    verificationCode,
    newPassword,
    idToken: getAuthSession()?.IdToken || "",
    onSuccess: () => {
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_PASSWORD_RESET,
      });
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1000);
    },
    onError: (err: unknown) => {
      let errorMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setAlert({
        type: AlertType.ERROR,
        message: errorMessage,
      });
    },
  });

  const goToVerifyingStep = async () => {
    try {
      setIsLoading(true);
      await initiateReset();
    } finally {
      setIsLoading(false);
    }
  };

  const onSetNewPassword = async () => {
    try {
      setIsLoading(true);
      await confirmReset();
    } finally {
      setIsLoading(false);
    }
  };

  if (step === ResetPasswordStep.VERIFY_CODE) {
    return (
      <div className="flex h-screen w-screen place-items-center">
        <VerifyWidget
          isLoading={isLoading}
          verificationCode={verificationCode}
          onVerify={() => setStep(ResetPasswordStep.ENTER_NEW_PASSWORD)}
          handleChange={handleChange}
          onResendVerificationCode={() => {}}
          showResendVerificationCode={false}
          canSubmit={verificationCode.length !== 0}
          goBack={() => setStep(ResetPasswordStep.ENTER_EMAIL)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen place-items-center">
      <ResetPassowrdWidget
        isLoading={isLoading}
        email={email}
        newPassword={newPassword}
        onSetNewPassword={onSetNewPassword}
        handleChange={handleChange}
        step={step}
        goToVerifyingStep={goToVerifyingStep}
        showPassword={showPassword}
        onShowPassword={() => setShowPassword(!showPassword)}
        onCancel={() => setStep(ResetPasswordStep.VERIFY_CODE)}
        canSubmit={
          (step === ResetPasswordStep.ENTER_EMAIL && email.length !== 0) ||
          (step === ResetPasswordStep.ENTER_NEW_PASSWORD &&
            newPassword.length !== 0)
        }
        goBackToVerifyCode={() => {
          setStep(ResetPasswordStep.VERIFY_CODE);
        }}
      />
    </div>
  );
};

export const ResetPassword = () => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <ResetPasswordController />
    </QueryClientProvider>
  );
};
