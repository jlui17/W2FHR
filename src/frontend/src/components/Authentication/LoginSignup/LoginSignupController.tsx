import { AxiosError } from "axios";
import { useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../AuthenticationContextProvider";
import { AlertInfo, AlertType } from "../../common/Alerts";
import {
  ERROR_MESSAGSES,
  INFO_MESSAGES,
  SUCCESS_MESSAGES,
} from "../../common/constants";
import { VerifyWidget } from "../common/VerifyWidget";
import {
  confirmAccount,
  loginAndGetAuthSession,
  sendVerificationCode,
  signUpAndGetNeedToConfirm,
} from "../helpers/authentication";
import { LoginSignupWidget } from "./LoginSignupWidget";

const AuthenticationController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isConfirmingAccount, setIsConfirmingAccount] = useState(false);
  const { setAuthSession } = useContext(AuthenticationContext);
  const navigate = useNavigate();

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

  const closeAlert = () => {
    setAlert(null);
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
        message: ERROR_MESSAGSES.UNKNOWN_ERROR,
      };

      if (err instanceof Error) {
        errorAlert.message = err.message;
      }

      if (err instanceof AxiosError) {
        errorAlert.message = err.response?.data;
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
    } catch (err) {
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGSES.UNKNOWN_ERROR,
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
      await sendVerificationCode(email);
      setAlert({
        type: AlertType.INFO,
        message: INFO_MESSAGES.VERIFICATION_CODE_SENT,
      });
    } catch (err) {
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGSES.UNKNOWN_ERROR,
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
      console.log(authSession);
      setAuthSession(authSession);
    } catch (err) {
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGSES.UNKNOWN_ERROR,
      };
      if (err instanceof Error) {
        errorAlert.message = err.message;
      }

      console.error(err);
      setAlert(errorAlert);
    }
    setIsLoading(false);
  };

  const onResetPassword = () => navigate("/resetPassword");

  return isConfirmingAccount ? (
    <VerifyWidget
      isLoading={isLoading}
      verificationCode={verificationCode}
      onVerify={onConfirmAccount}
      onResendVerificationCode={onSendVerificationCode}
      handleChange={handleChange}
      alert={alert}
      closeAlert={closeAlert}
    />
  ) : (
    <LoginSignupWidget
      email={email}
      password={password}
      isLoading={isLoading}
      alert={alert}
      handleChange={handleChange}
      onSignup={onSignup}
      onLogin={onLogin}
      onResetPassword={onResetPassword}
      closeAlert={closeAlert}
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
