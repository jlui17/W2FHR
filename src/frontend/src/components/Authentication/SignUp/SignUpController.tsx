import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "react-query";
import { z } from "zod";
import { AlertType, useAlert } from "../../common/Alerts";
import { useSignUp } from "../helpers/authentication";
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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAlert } = useAlert();

  function onShowPassword(): void {
    setShowPassword(!showPassword);
  }

  const { mutateAsync: doSignUp } = useSignUp({
    onSuccess: (data) => {
      if (data.needsConfirmation) {
        setIsLoading(false);
      }
    },
    onError: (err: any) => {
      setIsLoading(false);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign up";
      setAlert({ type: AlertType.ERROR, message: errorMessage });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <SignUpWidget
      isLoading={isLoading}
      form={form}
      showPassword={showPassword}
      onShowPassword={onShowPassword}
    />
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
