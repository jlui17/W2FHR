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
import { UseFormHandleSubmit, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { AuthWidget } from "../AuthWidget";
import { formSchema } from "./SignupController";

export function SignUpWidget(p: {
  form: UseFormReturn<z.infer<typeof formSchema>, any, undefined>;
  showPassword: boolean;
  onShowPassword: () => void;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: (v: z.infer<typeof formSchema>) => void;
  handleSubmit: UseFormHandleSubmit<z.infer<typeof formSchema>, undefined>;
}): JSX.Element {
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
                Sign Up
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
