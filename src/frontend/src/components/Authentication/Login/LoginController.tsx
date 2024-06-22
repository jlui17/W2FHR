import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthenticationContext } from "../../AuthenticationContextProvider";
import { AlertType, useAlert } from "../../common/Alerts";
import { ERROR_MESSAGES, ROUTES } from "../../common/constants";
import { useLogin } from "../helpers/authentication";
import { LoginWidget } from "./LoginWidget";

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

const LoginController = () => {
  const [isLoading, setIsLoading] = useState(false);
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
      if (err instanceof Error) {
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

  function onSignUp(): void {
    navigate(ROUTES.SIGNUP);
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
  ) : (
    <LoginWidget
      isLoading={isLoading}
      onSignup={onSignUp}
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
