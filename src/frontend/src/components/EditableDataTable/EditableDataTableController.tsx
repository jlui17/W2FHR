"use client";

import React from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { EditableDataTableForm } from "./EditableDataTableForm";
import { SchedulingData } from "@/components/Scheduling/helpers/hooks";
import {
  fetchData,
  NewScheduleSchemaFormData,
} from "@/components/EditableDataTable/helpers/hooks";

const queryClient = new QueryClient();

export function EditableDataTableController() {
  const [date, setDate] = React.useState<Date>(new Date());
  const { data, isLoading, error } = useQuery<SchedulingData>({
    queryKey: ["data"],
    queryFn: fetchData,
    initialData: {
      availability: {},
      metadata: {
        shiftTitles: new Set<string>(),
        shiftTimes: [],
        breakDurations: [],
      },
      showMonday: false,
      disableUpdates: false,
      startOfWeek: new Date(),
    },
  });

  const form: UseFormReturn<NewScheduleSchemaFormData> =
    useForm<NewScheduleSchemaFormData>({
      defaultValues: {
        rows: [
          {
            employeeName: "",
            shiftTitle: "",
            start: "",
            end: "",
            breakDuration: "",
          },
        ],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const addRow = () => {
    append({
      employeeName: "",
      shiftTitle: "",
      start: "",
      end: "",
      breakDuration: "",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log(data);
  return (
    <EditableDataTableForm
      control={form.control}
      fields={fields}
      employeeNames={["Jon Doe", "Baker Field", "Hello World"]}
      shiftTitles={Array.from(data.metadata.shiftTitles)}
      shiftTimes={data.metadata.shiftTimes}
      breakDurations={data.metadata.breakDurations}
      onSubmit={form.handleSubmit(onSubmit)}
      addRow={addRow}
      removeRow={remove}
      isSubmitting={false}
      date={date}
      setDate={setDate}
    />
  );
}

export function EditableDataTable() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditableDataTableController />
    </QueryClientProvider>
  );
}
