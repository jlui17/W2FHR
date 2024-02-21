import { UserNotConfirmedException } from "@aws-sdk/client-cognito-identity-provider";
import { useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../../common/Alerts";
import {
  API_URLS,
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
  useSignUp,
} from "../helpers/authentication";
import { LoginSignupWidget } from "./LoginSignupWidget";

const AuthenticationController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isConfirmingAccount, setIsConfirmingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { saveAuthSession, isLoggedIn, getAuthSession } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const { setAlert } = useAlert();


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "email":
        setEmail(value.trim());
        break;
      case "password":
        setPassword(value);
        break;
      case "verificationCode":
        setVerificationCode(value.trim());
        break;
      default:
        break;
    }
  };

  const { mutateAsync: doSignUp, isError, error } = useSignUp({
    email,
    password,
    idToken: getAuthSession()?.IdToken || "",
    onSuccess: (data) => {
      console.log(data);
      if (data.needsConfirmation) {     
        setIsLoading(false)
        setIsConfirmingAccount(true);        

      }
    },
    onError: (err: any) => {
      setIsLoading(false);
      if (err instanceof UserNotConfirmedException) {
        setIsConfirmingAccount(true);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
        setAlert({ type: AlertType.ERROR, message: errorMessage });
      }
    }
  });
  
  const onSignup = async () => {
    setIsLoading(true);
    try {
      await doSignUp(); 
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
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
    setIsConfirmingAccount(false);
    setIsLoading(false);
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
    setPassword("");
    setIsLoading(false);
  };

  const onResetPassword = () => navigate(ROUTES.RESET_PASSWORD);

  return isLoggedIn() ? (
    <Navigate to={ROUTES.DASHBOARD} />
  ) : isConfirmingAccount ? (
    <div className="flex h-screen w-screen place-items-center">
      <VerifyWidget
        isLoading={isLoading}
        verificationCode={verificationCode}
        onVerify={onConfirmAccount}
        onResendVerificationCode={onSendVerificationCode}
        handleChange={handleChange}
        showResendVerificationCode={true}
        canSubmit={verificationCode.length !== 0}
      />
    </div>
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
      canSubmit={email.length !== 0 && password.length !== 0}
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
