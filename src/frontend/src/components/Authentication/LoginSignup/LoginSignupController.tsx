import { UserNotConfirmedException } from "@aws-sdk/client-cognito-identity-provider";
import { useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../AuthenticationContextProvider";
import { AlertContext, AlertInfo, AlertType } from "../../common/Alerts";
import {
  ERROR_MESSAGES,
  INFO_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
} from "../../common/constants";
import { VerifyWidget } from "../common/VerifyWidget";
import {
  confirmAccount,
  loginAndGetAuthSession,
  resendSignupVerificationCode,
  signUpAndGetNeedToConfirm,
} from "../helpers/authentication";
import { LoginSignupWidget } from "./LoginSignupWidget";

const AuthenticationController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isConfirmingAccount, setIsConfirmingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { saveAuthSession, isLoggedIn } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "verificationCode":
        setVerificationCode(value);
        break;
      default:
        break;
    }
  };

  const onSignup = async () => {
    setIsLoading(true);
    try {
      const needToConfirm = await signUpAndGetNeedToConfirm(email, password);
      if (needToConfirm) {
        setIsConfirmingAccount(true);
      }
    } catch (err) {
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      };

      if (err instanceof Error) {
        errorAlert.message = err.message;
      }

      console.error(`Signup Error: ${errorAlert.message}`);
      setAlert(errorAlert);
    }
    setIsLoading(false);
  };

  const onConfirmAccount = async () => {
    setIsLoading(true);
    try {
      await confirmAccount(email, verificationCode);
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
      });
      setVerificationCode("");
    } catch (err) {
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
      if (err instanceof Error) {
        errorAlert.message = err.message;
      }

      console.error(err);
      setAlert(errorAlert);
    }
    setIsLoading(false);
    setIsConfirmingAccount(false);
  };

  const onSendVerificationCode = async () => {
    setIsLoading(true);
    try {
      await resendSignupVerificationCode(email);
      setAlert({
        type: AlertType.INFO,
        message: INFO_MESSAGES.VERIFICATION_CODE_SENT,
      });
    } catch (err) {
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
      if (err instanceof Error) {
        errorAlert.message = err.message;
      }

      console.error(err);
      setAlert(errorAlert);
    }
    setIsLoading(false);
  };

  const onLogin = async () => {
    setIsLoading(true);
    try {
      const authSession = await loginAndGetAuthSession(email, password);
      saveAuthSession(authSession);
    } catch (err) {
      console.error(err);
      if (err instanceof UserNotConfirmedException) {
        setVerificationCode("");
        setIsConfirmingAccount(true);
        await onSendVerificationCode();
      } else {
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        };

        if (err instanceof Error) {
          errorAlert.message = err.message;
        }

        setAlert(errorAlert);
      }
    }
    setEmail("");
    setPassword("");
    setIsLoading(false);
  };

  const onResetPassword = () => navigate(ROUTES.RESET_PASSWORD);

  return isLoggedIn() ? (
    <Navigate to={ROUTES.DASHBOARD} />
  ) : isConfirmingAccount ? (
    <VerifyWidget
      isLoading={isLoading}
      verificationCode={verificationCode}
      onVerify={onConfirmAccount}
      onResendVerificationCode={onSendVerificationCode}
      handleChange={handleChange}
      showResendVerificationCode={true}
    />
  ) : (
    <LoginSignupWidget
      email={email}
      password={password}
      isLoading={isLoading}
      handleChange={handleChange}
      onSignup={onSignup}
      onLogin={onLogin}
      onResetPassword={onResetPassword}
      showPassword={showPassword}
      onShowPassword={() => setShowPassword(!showPassword)}
    />
  );
};

export const LoginSignup = () => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthenticationController />
    </QueryClientProvider>
  );
};
