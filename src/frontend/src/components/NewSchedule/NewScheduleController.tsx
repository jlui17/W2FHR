"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, UseFormReturn, useWatch } from "react-hook-form";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { NewScheduleForm } from "./NewScheduleForm";
import { SchedulingData } from "@/components/Scheduling/helpers/hooks";
import {
  fetchData,
  getBlankTemplate,
  getGamesTemplate,
  getWWTemplate,
  NewScheduleSchemaFormData,
} from "@/components/NewSchedule/helpers/hooks";
import { dateToFormatForUser } from "@/components/common/constants";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";

const queryClient = new QueryClient();

function NewScheduleController() {
  const { getAuthSession } = useContext(AuthenticationContext);
  const [date, setDate] = useState<Date>(new Date());
  // const { isLoading, error, data } = useSchedulingData({
  //   idToken: getAuthSession()?.idToken || "",
  // });
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

  const form: UseFormReturn<NewScheduleSchemaFormData> = useForm<NewScheduleSchemaFormData>({
    defaultValues: getBlankTemplate(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  const watchedRows = useWatch({
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

  function useBlankTemplate(): void {
    form.setValue("rows", getBlankTemplate().rows);
  }

  function useGamesTemplate(): void {
    form.setValue("rows", getGamesTemplate().rows);
  }

  function useWWTemplate(): void {
    form.setValue("rows", getWWTemplate().rows);
  }

  const availableEmployees: string[] = data.availability[dateToFormatForUser(date)] || [];
  const remainingAvailableEmployees: Set<string> = useMemo(() => {
    const formValues = form.getValues();
    return new Set(formValues.rows?.map((row) => row.employeeName).filter(Boolean) || []);
  }, [watchedRows, date]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  useEffect(() => {
    setDate(data.startOfWeek);
  }, [data.startOfWeek]);

  return (
    <NewScheduleForm
      control={form.control}
      fields={fields}
      availableEmployees={availableEmployees}
      selectedEmployees={remainingAvailableEmployees}
      shiftTitles={Array.from(data.metadata.shiftTitles)}
      shiftTimes={data.metadata.shiftTimes}
      breakDurations={data.metadata.breakDurations}
      onSubmit={form.handleSubmit(onSubmit)}
      addRow={addRow}
      removeRow={remove}
      isSubmitting={false}
      date={date}
      setDate={setDate}
      useBlankTemplate={useBlankTemplate}
      useGamesTemplate={useGamesTemplate}
      useWWTemplate={useWWTemplate}
    />
  );
}

export function NewSchedule() {
  return (
    <QueryClientProvider client={queryClient}>
      <NewScheduleController />
    </QueryClientProvider>
  );
}
