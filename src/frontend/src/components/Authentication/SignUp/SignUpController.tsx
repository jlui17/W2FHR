import { ROUTES, TOAST } from "@/components/common/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
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
  const navigate = useNavigate();

  const { mutateAsync: doSignUp } = useSignUp({
    onSuccess: (data) => {
      setIsLoading(false);
      setIsConfirming(data.needsConfirmation);
    },
    onError: (err: Error) => {
      setIsLoading(false);
      toast.error(TOAST.HEADERS.ERROR, {
        description: err.message,
        duration: TOAST.DURATIONS.ERROR,
      });
    },
  });

  const { mutateAsync: doConfirm } = useConfirmAccount({
    onSuccess: () => {
      setIsLoading(false);
      toast.success(TOAST.HEADERS.SUCCESS, {
        description: TOAST.MESSAGES.SUCCESSFUL_VERIFICATION,
        duration: TOAST.DURATIONS.SUCCESS,
      });
      navigate(ROUTES.DASHBOARD);
    },
    onError: (err: Error) => {
      setIsLoading(false);
      toast.error(TOAST.HEADERS.ERROR, {
        description: err.message,
        duration: TOAST.DURATIONS.ERROR,
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
        toast.success(TOAST.HEADERS.SUCCESS, {
          description: TOAST.MESSAGES.VERIFICATION_CODE_SENT,
          duration: TOAST.DURATIONS.SUCCESS,
        });
      },
      onError: (err: Error) => {
        setIsLoading(false);
        toast.error(TOAST.HEADERS.ERROR, {
          description: err.message,
          duration: TOAST.DURATIONS.ERROR,
        });
        console.error(err);
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
