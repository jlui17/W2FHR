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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthWidget } from "../AuthWidget";

const formSchema = z.object({
  code: z
    .string()
    .min(1, { message: "You must provide a confirmation code." })
    .transform((v) => Number(v) || -1),
});

export function Confirmation(p: {
  enableResend?: boolean;
  onResend?: () => void;
  isLoading: boolean;
  onConfirm: (code: number) => void;
  onCancel: () => void;
}): JSX.Element {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (data.code === -1) {
      form.setError("code", {
        type: "custom",
        message: "The confirmation code you provided isn't a valid number.",
      });
      return;
    }

    p.onConfirm(data.code);
  }

  return (
    <div className="flex h-screen w-screen place-items-center">
      <AuthWidget>
        <p className="break-normal">
          A confirmation code has been sent to your email. Please check and
          enter it here to move on.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation Code</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {p.enableResend ? (
                <Button
                  type="button"
                  className="mb-4 inline-block w-fit pl-0 text-xs"
                  variant="link"
                  onClick={p.onResend}
                  disabled={p.isLoading}
                >
                  Resend confirmation code
                </Button>
              ) : null}
            </div>
            <div className="flex w-auto items-center justify-evenly">
              <Button
                type="submit"
                disabled={p.isLoading}
                className="mr-4 w-full"
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                onClick={p.onCancel}
                className="w-full"
                disabled={p.isLoading}
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
