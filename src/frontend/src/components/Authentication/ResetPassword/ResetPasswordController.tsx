import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AlertType, useAlert } from "../../common/Alerts";
import {
  INFO_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
} from "../../common/constants";
import {
  AccountSecurityFormSchema,
  AccountSecurityWidget,
} from "../AccountSecurityWidget";
import { Confirmation } from "../Confirmation/Confirmation";
import {
  confirmPasswordReset,
  initiatePasswordReset,
} from "../helpers/authentication";

const ResetPasswordController = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const { mutateAsync: doInitReset } = initiatePasswordReset({
    onSuccess: () => {
      setIsLoading(false);
      setAlert({
        type: AlertType.INFO,
        message: INFO_MESSAGES.VERIFICATION_CODE_SENT,
      });
    },
    onError: (err: Error) => {
      setIsLoading(false);
      setAlert({
        type: AlertType.ERROR,
        message: err.message,
      });
    },
  });

  const { mutateAsync: confirmReset } = confirmPasswordReset({
    onSuccess: () => {
      setIsLoading(false);
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_PASSWORD_RESET,
      });
      navigate(ROUTES.LOGIN);
    },
    onError: (err: Error) => {
      setIsLoading(false);
      let errorMessage: string = err.message;
      setAlert({
        type: AlertType.ERROR,
        message: errorMessage,
      });
    },
  });

  async function onConfirm(code: number): Promise<void> {
    setIsLoading(true);
    await confirmReset({ email, password, code: code.toString() });
  }

  const form = useForm<z.infer<typeof AccountSecurityFormSchema>>({
    resolver: zodResolver(AccountSecurityFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function resendConfirmationCode(): Promise<void> {
    setIsLoading(true);
    await doInitReset({ email });
  }

  async function onSubmit(v: z.infer<typeof AccountSecurityFormSchema>) {
    setEmail(v.email);
    setPassword(v.password);
    setIsConfirming(true);
  }

  return isConfirming ? (
    <Confirmation
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={() => setIsConfirming(false)}
      enableResend={true}
      onResend={resendConfirmationCode}
      resendOnMount={true}
    />
  ) : (
    <AccountSecurityWidget
      form={form}
      showPassword={showPassword}
      onShowPassword={() => setShowPassword(!showPassword)}
      isLoading={isLoading}
      onSubmit={onSubmit}
      onCancel={() => navigate(ROUTES.LOGIN)}
      submitButtonLabel="Reset"
      type="reset"
    />
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
