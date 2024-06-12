import { useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../../common/Alerts";
import {
  ERROR_MESSAGES,
  INFO_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
} from "../../common/constants";
import { VerifyWidget } from "../common/VerifyWidget";
import {
  resendSignupVerificationCode,
  useConfirmAccount,
  useLogin,
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
  const {
    saveAuthSession,
    isLoggedIn,
    getAuthSession,
    stayLoggedIn,
    setStayLoggedIn,
    logout,
  } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const [shouldStayLoggedIn, setShouldStayLoggedIn] = useState(stayLoggedIn());

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

  const { mutateAsync: doSignUp } = useSignUp({
    email,
    password,
    idToken: getAuthSession()?.IdToken || "",
    onSuccess: (data) => {
      console.log(data);
      if (data.needsConfirmation) {
        setIsLoading(false);
        setIsConfirmingAccount(true);
      }
    },
    onError: (err: any) => {
      setIsLoading(false);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign up";
      setAlert({ type: AlertType.ERROR, message: errorMessage });
    },
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

  const { mutateAsync: confirmAccount } = useConfirmAccount({
    email,
    verificationCode,
    idToken: getAuthSession()?.IdToken || "",
    onSuccess: (data) => {
      console.log(data);
      console.log("success");
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
      });

      setVerificationCode("");
      setIsLoading(false);
      navigate(ROUTES.DASHBOARD);
    },
    onError: (err: unknown) => {
      let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorMessage = "You have inputted the wrong code";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setAlert({
        type: AlertType.ERROR,
        message: errorMessage,
      });

      console.error(err);
      setIsLoading(false);
    },
  });

  const onConfirmAccount = async () => {
    setIsLoading(true);
    try {
      await confirmAccount();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const onSendVerificationCode = async () => {
    setIsLoading(true);
    try {
      await resendSignupVerificationCode(
        email,
        getAuthSession()?.IdToken || ""
      );
      setAlert({
        type: AlertType.INFO,
        message: INFO_MESSAGES.VERIFICATION_CODE_SENT,
      });
    } catch (err: any) {
      console.log(err);
      const errorAlert: AlertInfo = {
        type: AlertType.ERROR,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
      if (err.message == "LimitExceededException") {
        errorAlert.message =
          "Too many requests, Please wait. (Check your email for the code)";
      } else if (err instanceof Error) {
        errorAlert.message = err.message;
      }

      console.error(err);
      setAlert(errorAlert);
    }
    setIsLoading(false);
  };

  const { mutateAsync: login } = useLogin({
    email,
    password,
    refreshToken: getAuthSession()?.RefreshToken,

    onSuccess: (data) => {
      saveAuthSession(data);
      setStayLoggedIn(shouldStayLoggedIn);
      setAlert({
        type: AlertType.SUCCESS,
        message: "Login successful",
      });

      navigate(ROUTES.DASHBOARD);
    },
    onError: (err: any) => {
      logout();
      setShouldStayLoggedIn(false);
      let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (
        err instanceof Error &&
        err.message === ERROR_MESSAGES.EMPLOYEE_NOT_CONFIRMED
      ) {
        setVerificationCode("");
        setIsConfirmingAccount(true);
        onSendVerificationCode();
        return;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setAlert({
        type: AlertType.ERROR,
        message: errorMessage,
      });
      console.error(err);
      setIsLoading(false);
    },
  });

  const onLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const onResetPassword = () => navigate(ROUTES.RESET_PASSWORD);

  function onStayLoggedIn(event: React.ChangeEvent<HTMLInputElement>): void {
    const { checked } = event.target;
    setShouldStayLoggedIn(checked);
  }

  useEffect(() => {
    if (stayLoggedIn() && !isLoggedIn()) {
      onLogin();
    }
  }, []);

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
        goBack={() => {
          setIsConfirmingAccount(false);
        }}
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
      onStayLoggedIn={onStayLoggedIn}
      stayLoggedIn={shouldStayLoggedIn}
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
