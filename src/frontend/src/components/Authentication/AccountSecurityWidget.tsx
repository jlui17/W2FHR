import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { AuthWidget } from "./AuthWidget";

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\^\$\*\.\[\]\{\}\(\)\?\-\"!@#%&\/\\,><\':;|\_~`\+=]).{8,}$/
);
export const AccountSecurityFormSchema = z
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

export function AccountSecurityWidget(p: {
  form: UseFormReturn<
    z.infer<typeof AccountSecurityFormSchema>,
    any,
    undefined
  >;
  showPassword: boolean;
  onShowPassword: () => void;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: (v: z.infer<typeof AccountSecurityFormSchema>) => void;
  submitButtonLabel: string;
  type?: "signUp" | "reset";
}): JSX.Element {
  return (
    <div className="flex h-screen w-screen place-items-center">
      <AuthWidget>
        <h1 className="mx-auto mb-4 inline-block text-2xl">Employee Portal</h1>
        <Form {...p.form}>
          <form onSubmit={p.form.handleSubmit(p.onSubmit)}>
            <FormField
              control={p.form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={p.form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-4 mt-4">
                  <FormLabel>
                    {p.type === "reset" ? "New " : null}Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={p.showPassword ? "text" : "password"}
                        {...field}
                      />
                      <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400">
                        {p.showPassword ? (
                          <EyeOff
                            className="h-6 w-6"
                            onClick={p.onShowPassword}
                          />
                        ) : (
                          <Eye className="h-6 w-6" onClick={p.onShowPassword} />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={p.form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="mb-4 mt-4">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={p.showPassword ? "text" : "password"}
                        {...field}
                      />
                      <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400">
                        {p.showPassword ? (
                          <EyeOff
                            className="h-6 w-6"
                            onClick={p.onShowPassword}
                          />
                        ) : (
                          <Eye className="h-6 w-6" onClick={p.onShowPassword} />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <div className="flex w-auto items-center justify-evenly">
              <Button
                className="w-full"
                variant="default"
                disabled={p.isLoading}
                type="submit"
              >
                {p.submitButtonLabel}
              </Button>
              <Button
                onClick={p.onCancel}
                disabled={p.isLoading}
                className="ml-4 w-full"
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </AuthWidget>
    </div>
  );
}
