import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
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

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\^\$\*\.\[\]\{\}\(\)\?\-\"!@#%&\/\\,><\':;|\_~`\+=]).{8,}$/
);

export const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "You must provide an email." })
    .email("This is not a valid email."),
  password: z
    .string()
    .min(8, { message: "Your password must be at least 8 characters." })
    .regex(passwordValidation, {
      message:
        "Your password must have at least 1 lowercase, uppercase, special character, and number.",
    }),
  stayLoggedIn: z.boolean(),
});

const AuthenticationController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isConfirmingAccount, setIsConfirmingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    saveAuthSession,
    isLoggedIn,
    getAuthSession,
    stayLoggedIn: stayLoggedInContext,
    setStayLoggedIn: setStayLoggedInContext,
  } = useContext(AuthenticationContext);
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
        setConfirmationCode(value.trim());
        break;
      default:
        break;
    }
  };

  const { mutateAsync: doSignUp } = useSignUp({
    onSuccess: (data) => {
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

  const { mutateAsync: confirmAccount } = useConfirmAccount({
    onSuccess: (data) => {
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
      });

      setConfirmationCode("");
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

  const onSendVerificationCode = async () => {
    setIsLoading(true);
    const { email } = form.getValues();
    try {
      await resendSignupVerificationCode(email);
      setAlert({
        type: AlertType.INFO,
        message: INFO_MESSAGES.VERIFICATION_CODE_SENT,
      });
    } catch (err: any) {
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

  const { mutateAsync: login } = useLogin(
    (data) => {
      saveAuthSession(data);
      setAlert({
        type: AlertType.SUCCESS,
        message: "Login successful",
      });

      navigate(ROUTES.DASHBOARD);
    },
    (err: any) => {
      let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (
        err instanceof Error &&
        err.message === ERROR_MESSAGES.EMPLOYEE_NOT_CONFIRMED
      ) {
        setConfirmationCode("");
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
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      stayLoggedIn: stayLoggedInContext(),
    },
  });

  const onSignup = async () => {
    setIsLoading(true);
    try {
      const { email, password } = form.getValues();

      await doSignUp({ email, password });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const onConfirmAccount = async () => {
    setIsLoading(true);
    const { email } = form.getValues();
    try {
      await confirmAccount({ email, confirmationCode });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  async function onSubmit(v: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStayLoggedInContext(v.stayLoggedIn);
    try {
      await login({
        email: v.email,
        password: v.password,
        refreshToken: getAuthSession()?.RefreshToken,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const refreshToken = getAuthSession()?.RefreshToken;
    const canAutoLogin: boolean =
      stayLoggedInContext() && !isLoggedIn() && refreshToken != null;
    if (canAutoLogin) {
      login({
        email: "",
        password: "",
        refreshToken: refreshToken,
      });
    }
  }, []);

  return isLoggedIn() ? (
    <Navigate to={ROUTES.DASHBOARD} />
  ) : isConfirmingAccount ? (
    <div className="flex h-screen w-screen place-items-center">
      <VerifyWidget
        isLoading={isLoading}
        verificationCode={confirmationCode}
        onVerify={onConfirmAccount}
        onResendVerificationCode={onSendVerificationCode}
        handleChange={handleChange}
        showResendVerificationCode={true}
        canSubmit={confirmationCode.length !== 0}
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
      onSignup={onSignup}
      resetPasswordRoute={ROUTES.RESET_PASSWORD}
      showPassword={showPassword}
      onShowPassword={() => setShowPassword(!showPassword)}
      canSubmit={email.length !== 0 && password.length !== 0}
      handleSubmit={form.handleSubmit}
      onSubmit={onSubmit}
      form={form}
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
