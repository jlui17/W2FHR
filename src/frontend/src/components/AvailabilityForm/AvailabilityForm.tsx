import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserAvailability } from "./helpers/hooks";
import { ReactElement } from "react";

const AvailabilitySchema = z.object({
  days: z.array(z.string()).optional(),
});

export function LoadingAvailabilityForm() {
  return (
    <Card className="w-11/12 lg:w-auto">
      <CardHeader>
        <CardTitle className="m-auto">Availability</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </CardContent>
    </Card>
  );
}

function getInitialData(a: UserAvailability | undefined) {
  const res: string[] = [];

  if (a !== undefined) {
    if (a.day1.isAvailable) res.push("day1");
    if (a.day2.isAvailable) res.push("day2");
    if (a.day3.isAvailable) res.push("day3");
    if (a.day4.isAvailable) res.push("day4");
  }

  return res;
}

export const AvailabilityForm = (p: {
  updateIsPending: boolean;
  availability: UserAvailability;
  updateAvailability: (days: string[] | undefined) => void;
}): ReactElement => {
  const form = useForm<z.infer<typeof AvailabilitySchema>>({
    resolver: zodResolver(AvailabilitySchema),
    defaultValues: {
      days: getInitialData(p.availability),
    },
  });

  async function onSubmit(v: z.infer<typeof AvailabilitySchema>) {
    p.updateAvailability(v.days);
  }

  const items: { id: string; date: string }[] = [
    { id: "day1", date: p.availability.day1.date },
    { id: "day2", date: p.availability.day2.date },
    { id: "day3", date: p.availability.day3.date },
  ];
  if (p.availability.showMonday) {
    items.push({ id: "day4", date: p.availability.day4.date });
  }

  function checkboxes(): ReactElement {
    return (
      <FormField
        control={form.control}
        name="days"
        render={() => (
          <FormItem>
            {items.map((d) =>
              d.date === "" ? null : (
                <FormField
                  key={d.id}
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem
                      key={d.id}
                      className="flex h-11 w-auto flex-row items-center space-y-0 rounded transition-colors duration-100 ease-in-out hover:bg-slate-100"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(d.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange(
                                  field.value ? [...field.value, d.id] : [d.id],
                                )
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== d.id,
                                  ),
                                );
                          }}
                          id={"check" + d.id}
                          disabled={p.updateIsPending}
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor={"check" + d.id}
                        className="ml-2 flex h-full w-full items-center font-normal"
                      >
                        {d.date}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ),
            )}
          </FormItem>
        )}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        className="w-11/12 lg:mx-auto lg:w-3/4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle className="m-auto">Availability</CardTitle>
          </CardHeader>
          <CardContent>{checkboxes()}</CardContent>
          <CardFooter>
            <Button
              className="m-auto"
              type="submit"
              disabled={p.updateIsPending || !p.availability.canUpdate}
            >
              {p.updateIsPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
