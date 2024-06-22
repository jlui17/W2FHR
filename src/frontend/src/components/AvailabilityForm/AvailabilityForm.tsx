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
  days: z.array(z.string()).refine((v) => v.some((d) => d)),
});

export const AvailabilityForm = (p: {
  isLoading: boolean;
  availability: UserAvailability;
  formData: string[];
}): JSX.Element => {
  const form = useForm<z.infer<typeof AvailabilitySchema>>({
    resolver: zodResolver(AvailabilitySchema),
    defaultValues: {
      days: p.formData,
    },
  });

  async function onSubmit(v: z.infer<typeof AvailabilitySchema>) {
    console.log(v);
  }

  const items: { id: string; date: string }[] = [
    { id: "day1", date: p.availability.day1.date },
    { id: "day2", date: p.availability.day2.date },
    { id: "day3", date: p.availability.day3.date },
    { id: "day4", date: p.availability.day4.date },
  ];

  function getAvailabilityBoxes(): JSX.Element {
    return (
      <FormField
        control={form.control}
        name="days"
        render={() => (
          <FormItem>
            {items.map((d) => (
              <FormField
                key={d.id}
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem key={d.id}>
                    <FormControl className="mb-5 flex flex-row items-center">
                      <Checkbox
                        checked={field.value?.includes(d.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, d.id])
                            : field.onChange(
                                field.value?.filter((value) => value !== d.id)
                              );
                        }}
                        id={"check" + d.id}
                        disabled={p.isLoading}
                      />
                      <FormLabel htmlFor={"check" + d.id} className="ml-2">
                        {d.date}
                      </FormLabel>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </FormItem>
        )}
      />
    );
  }

  return (
    <Card className="w-[275px]">
      <CardHeader>
        <CardTitle className="m-auto">Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {getAvailabilityBoxes()}
          </form>
        </Form>
      </CardContent>
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
  );
};
