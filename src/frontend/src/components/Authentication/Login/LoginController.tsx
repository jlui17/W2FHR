import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthenticationContext } from "../../AuthenticationContextProvider";
import { AlertInfo, AlertType, useAlert } from "../../common/Alerts";
import {
  INFO_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
} from "../../common/constants";
import { Confirmation } from "../Confirmation/Confirmation";
import {
  NotConfirmedException,
  useConfirmAccount,
  useLogin,
  useSendSignUpConfirmationCode,
} from "../helpers/authentication";
import { LoginWidget } from "./LoginWidget";

export const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "You must provide an email." })
    .email("This is not a valid email."),
  password: z.string(),
  stayLoggedIn: z.boolean(),
});

const LoginController = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const {
    saveAuthSession,
    isLoggedIn,
    getAuthSession,
    stayLoggedIn: stayLoggedInContext,
    setStayLoggedIn: setStayLoggedInContext,
  } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const { mutateAsync: login } = useLogin(
    (data) => {
      saveAuthSession(data);
      setAlert({
        type: AlertType.SUCCESS,
        message: "Login successful",
      });

      navigate(ROUTES.DASHBOARD);
    },
    (err: Error) => {
      setIsLoading(false);
      if (err instanceof NotConfirmedException) {
        setIsConfirming(true);
        return;
      }

      let errorMessage = err.message;
      setAlert({
        type: AlertType.ERROR,
        message: errorMessage,
      });
      console.error(err);
    }
  );

  const { mutateAsync: doConfirm } = useConfirmAccount({
    onSuccess: () => {
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
      });

      setIsLoading(false);
      navigate(ROUTES.DASHBOARD);
    },
    onError: (err: Error) => {
      setAlert({
        type: AlertType.ERROR,
        message: err.message,
      });

      console.error(err);
      setIsLoading(false);
    },
  });

  const onConfirm = async (confirmationCode: number) => {
    setIsLoading(true);
    await doConfirm({ email, code: confirmationCode.toString() });
  };

  const { mutateAsync: doSendSignUpConfirmationCode } =
    useSendSignUpConfirmationCode({
      onSuccess: () => {
        setIsLoading(false);
        setAlert({
          type: AlertType.INFO,
          message: INFO_MESSAGES.VERIFICATION_CODE_SENT,
        });
      },
      onError: (err: Error) => {
        setIsLoading(false);
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: err.message,
        };

        console.error(err);
        setAlert(errorAlert);
      },
    });

  const onResend = async () => {
    setIsLoading(true);
    await doSendSignUpConfirmationCode({ email });
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      stayLoggedIn: stayLoggedInContext(),
    },
  });

  async function onSubmit(v: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStayLoggedInContext(v.stayLoggedIn);
    try {
      setEmail(v.email);
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

  // try auto loggin in
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
  ) : isConfirming ? (
    <Confirmation
      enableResend={true}
      onResend={onResend}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={() => setIsConfirming(false)}
      resendOnMount={true}
    />
  ) : (
    <LoginWidget
      isLoading={isLoading}
      onSignup={() => navigate(ROUTES.SIGNUP)}
      resetPasswordRoute={ROUTES.RESET_PASSWORD}
      showPassword={showPassword}
      onShowPassword={() => setShowPassword(!showPassword)}
      handleSubmit={form.handleSubmit}
      onSubmit={onSubmit}
      form={form}
    />
  );
};

export const Login = () => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <LoginController />
    </QueryClientProvider>
  );
};
