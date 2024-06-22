import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { UseFormHandleSubmit, UseFormReturn } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { AuthWidget } from "../AuthWidget";
import { formSchema } from "./LoginController";

export const LoginWidget = (p: {
  isLoading: boolean;
  onSignup: () => void;
  resetPasswordRoute: string;
  showPassword: boolean;
  onShowPassword: () => void;
  form: UseFormReturn<z.infer<typeof formSchema>, any, undefined>;
  handleSubmit: UseFormHandleSubmit<z.infer<typeof formSchema>, undefined>;
  onSubmit: (v: z.infer<typeof formSchema>) => void;
}) => {
  return (
    <div className="flex h-screen w-screen place-items-center">
      <AuthWidget>
        <h1 className="mx-auto mb-4 inline-block text-2xl">Employee Portal</h1>
        <Form {...p.form}>
          <form onSubmit={p.handleSubmit(p.onSubmit)}>
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
                  <FormLabel>Password</FormLabel>
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
            <div className="flex w-auto items-start justify-between">
              <FormField
                control={p.form.control}
                name="stayLoggedIn"
                render={({ field }) => (
                  <FormItem className="mt-2 flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-1">Stay Logged In?</FormLabel>
                  </FormItem>
                )}
              />
              <Link
                className={buttonVariants({ variant: "link" })}
                to={"/resetPassword"}
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex w-auto items-center justify-evenly">
              <Button
                className="w-full"
                variant="default"
                disabled={p.isLoading}
                type="submit"
              >
                {p.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  "Login"
                )}
              </Button>
              <Button
                className="ml-4 w-full"
                variant="secondary"
                onClick={p.onSignup}
                disabled={p.isLoading}
              >
                {p.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </AuthWidget>
    </div>
  );
};
