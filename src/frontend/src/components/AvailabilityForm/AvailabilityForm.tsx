import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent, FormControl } from "@mui/material";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserAvailability } from "./helpers/hooks";

const AvailabilitySchema = z.object({
  days: z.array(z.string()).optional(),
});

function Loading() {
  return (
    <Card className="w-[275px]">
      <CardHeader>
        <CardTitle className="m-auto">Availability</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </CardContent>
    </Card>
  );
}

export const AvailabilityForm = (p: {
  isLoading: boolean;
  availability: UserAvailability;
  updateAvailability: (days: string[] | undefined) => void;
}): JSX.Element => {
  if (p.isLoading) {
    return <Loading />;
  }

  const form = useForm<z.infer<typeof AvailabilitySchema>>({
    resolver: zodResolver(AvailabilitySchema),
    defaultValues: {
      days: getFormData(),
    },
  });

  function getFormData() {
    const res: string[] = [];

    if (!p.isLoading && p.availability !== undefined) {
      if (p.availability.day1.isAvailable) res.push("day1");
      if (p.availability.day2.isAvailable) res.push("day2");
      if (p.availability.day3.isAvailable) res.push("day3");
      if (p.availability.day4.isAvailable) res.push("day4");
    }

    return res;
  }

  async function onSubmit(v: z.infer<typeof AvailabilitySchema>) {
    console.log(v);
    p.updateAvailability(v.days);
  }

  const items: { id: string; date: string }[] = [
    { id: "day1", date: p.availability.day1.date },
    { id: "day2", date: p.availability.day2.date },
    { id: "day3", date: p.availability.day3.date },
    { id: "day4", date: p.availability.day4.date },
  ];

  function checkboxes(): JSX.Element {
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
                    <FormItem key={d.id}>
                      <FormControl className="flex flex-row items-center p-3 rounded transition-colors duration-200 ease-in-out hover:bg-slate-100">
                        <Checkbox
                          checked={field.value?.includes(d.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange(
                                  field.value ? [...field.value, d.id] : [d.id]
                                )
                              : field.onChange(
                                  field.value?.filter((value) => value !== d.id)
                                );
                          }}
                          id={"check" + d.id}
                          disabled={p.isLoading}
                        />
                        <FormLabel
                          htmlFor={"check" + d.id}
                          className="text-md ml-2"
                        >
                          {d.date}
                        </FormLabel>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )
            )}
          </FormItem>
        )}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="m-auto">Availability</CardTitle>
          </CardHeader>
          <CardContent>{checkboxes()}</CardContent>
          <CardFooter>
            <Button className="m-auto" type="submit" disabled={p.isLoading}>
              {p.isLoading ? (
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
