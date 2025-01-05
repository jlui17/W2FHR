import React, { useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, UseFormReturn, useWatch } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NewScheduleForm } from "./NewScheduleForm";
import { useSchedulingData } from "@/components/Scheduling/helpers/hooks";
import {
  getBlankTemplate,
  getGamesTemplate,
  getWWTemplate,
  NewScheduleSchemaFormData,
  SHIFT_DESIGNATIONS,
  usePostNewSchedule,
} from "@/components/NewSchedule/helpers/hooks";
import { dateToFormatForUser, TOAST } from "@/components/common/constants";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";
import { toast } from "sonner";

const queryClient = new QueryClient();

function NewScheduleController() {
  const { getAuthSession } = useContext(AuthenticationContext);
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState<boolean>(false);
  const {
    isFetching,
    data: schedulingData,
    refetch: refetchSchedulingData,
  } = useSchedulingData({
    idToken: getAuthSession()?.idToken || "",
  });

  const { mutate: postNewSchedule, isPending: isSubmitting } = usePostNewSchedule({
    onSuccess: () => {
      toast.success(TOAST.HEADERS.SUCCESS, {
        description: "The new schedule has been posted.",
        duration: TOAST.DURATIONS.SUCCESS,
      });
    },
    onError: (err: Error) => {
      console.error(`Error while posting new schedule:\n${err}`);
      toast.error(TOAST.HEADERS.ERROR, {
        description: err.message,
        duration: TOAST.DURATIONS.ERROR,
      });
    },
  });

  const form: UseFormReturn<NewScheduleSchemaFormData> = useForm<NewScheduleSchemaFormData>({
    defaultValues: getBlankTemplate(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shifts",
  });

  const watchedRows = useWatch({
    control: form.control,
    name: "shifts",
  });

  const onSubmit = (data: NewScheduleSchemaFormData) => {
    postNewSchedule({
      idToken: getAuthSession()?.idToken || "",
      newSchedule: data,
      date: date,
    });
  };

  const addRow = () => {
    append({
      employee: "",
      shiftTitle: "",
      startTime: "",
      endTime: "",
      breakDuration: "",
      designation: "Games",
    });
  };

  function useBlankTemplate(): void {
    form.setValue("shifts", getBlankTemplate().shifts);
  }

  function useGamesTemplate(): void {
    form.setValue("shifts", getGamesTemplate().shifts);
  }

  function useWWTemplate(): void {
    form.setValue("shifts", getWWTemplate().shifts);
  }

  function onOpenChange(): void {
    setOpen(!open);
  }

  const availableEmployees: string[] = schedulingData.availability[dateToFormatForUser(date)] || [];
  const remainingAvailableEmployees: Set<string> = useMemo(() => {
    const formValues = form.getValues();
    return new Set(formValues.shifts?.map((row) => row.employee).filter(Boolean) || []);
  }, [watchedRows, date]);

  useEffect(() => {
    setDate(schedulingData.startOfWeek);
  }, [schedulingData.startOfWeek]);

  return (
    <NewScheduleForm
      control={form.control}
      fields={fields}
      availableEmployees={availableEmployees}
      selectedEmployees={remainingAvailableEmployees}
      shiftTitles={Array.from(schedulingData.metadata.shiftTitles)}
      shiftTimes={schedulingData.metadata.shiftTimes}
      breakDurations={schedulingData.metadata.breakDurations}
      designations={[...SHIFT_DESIGNATIONS]}
      onSubmit={form.handleSubmit(onSubmit)}
      addRow={addRow}
      removeRow={remove}
      isSubmitting={isFetching || isSubmitting}
      date={date}
      setDate={setDate}
      useBlankTemplate={useBlankTemplate}
      useGamesTemplate={useGamesTemplate}
      useWWTemplate={useWWTemplate}
      open={open}
      onOpenChange={onOpenChange}
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
