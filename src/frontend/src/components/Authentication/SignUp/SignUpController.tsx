import {
  ERROR_MESSAGES,
  INFO_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
} from "@/components/common/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AlertInfo, AlertType, useAlert } from "../../common/Alerts";
import { Confirmation } from "../Confirmation/Confirmation";
import {
  resendSignupVerificationCode,
  useConfirmAccount,
  useSignUp,
} from "../helpers/authentication";
import { SignUpWidget } from "./SignUpWidget";

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\^\$\*\.\[\]\{\}\(\)\?\-\"!@#%&\/\\,><\':;|\_~`\+=]).{8,}$/
);

export const formSchema = z
  .object({
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
    confirmPassword: z.string().min(8),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

function SignUpController(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const { setAlert } = useAlert();
  const navigate = useNavigate();

  function onShowPassword(): void {
    setShowPassword(!showPassword);
  }

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
      setAlert({
        type: AlertType.SUCCESS,
        message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
      });

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

  const onConfirm = async (confirmationCode: number) => {
    setIsLoading(true);
    try {
      await doConfirm({ email, code: confirmationCode.toString() });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    setIsLoading(true);
    try {
      await resendSignupVerificationCode({ email });
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(v: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await doSignUp({
        email: v.email,
        password: v.password,
      });
      setEmail(v.email);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
        <SignUpWidget
          isLoading={isLoading}
          form={form}
          showPassword={showPassword}
          onShowPassword={onShowPassword}
          onCancel={() => navigate(ROUTES.LOGIN)}
          onSubmit={onSubmit}
          handleSubmit={form.handleSubmit}
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
