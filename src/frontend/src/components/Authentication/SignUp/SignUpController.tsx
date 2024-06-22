import {
  INFO_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
} from "@/components/common/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AlertInfo, AlertType, useAlert } from "../../common/Alerts";
import {
  AccountSecurityFormSchema,
  AccountSecurityWidget,
} from "../AccountSecurityWidget";
import { Confirmation } from "../Confirmation/Confirmation";
import {
  useConfirmAccount,
  useSendSignUpConfirmationCode,
  useSignUp,
} from "../helpers/authentication";

function SignUpController(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const { setAlert } = useAlert();
  const navigate = useNavigate();

  const { mutateAsync: doSignUp } = useSignUp({
    onSuccess: (data) => {
      setIsLoading(false);
      setIsConfirming(data.needsConfirmation);
    },
    onError: (err: Error) => {
      setIsLoading(false);
      setAlert({ type: AlertType.ERROR, message: err.message });
    },
  });

  const { mutateAsync: doConfirm } = useConfirmAccount({
    onSuccess: () => {
      setIsLoading(false);
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
      });

      navigate(ROUTES.DASHBOARD);
    },
    onError: (err: Error) => {
      setIsLoading(false);
      setAlert({
        type: AlertType.ERROR,
        message: err.message,
      });

      console.error(err);
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

  const form = useForm<z.infer<typeof AccountSecurityFormSchema>>({
    resolver: zodResolver(AccountSecurityFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(v: z.infer<typeof AccountSecurityFormSchema>) {
    setIsLoading(true);
    setEmail(v.email);
    await doSignUp({
      email: v.email,
      password: v.password,
    });
  }

  return (
    <>
      {isConfirming ? (
        <Confirmation
          isLoading={false}
          enableResend={true}
          onResend={onResend}
          onConfirm={onConfirm}
          onCancel={() => setIsConfirming(false)}
        />
      ) : (
        <AccountSecurityWidget
          isLoading={isLoading}
          form={form}
          showPassword={showPassword}
          onShowPassword={() => setShowPassword(!showPassword)}
          onCancel={() => navigate(ROUTES.LOGIN)}
          onSubmit={onSubmit}
          submitButtonLabel="Sign Up"
        />
      )}
    </>
  );
}

export function SignUp(): JSX.Element {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <SignUpController />
    </QueryClientProvider>
  );
}
