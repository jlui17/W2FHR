import React, { useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, UseFormReturn, useWatch } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NewScheduleForm } from "./NewScheduleForm";
import { AvailableEmployee, useSchedulingData } from "@/components/Scheduling/helpers/hooks";
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
import { AvailableEmployeesTable } from "@/components/NewSchedule/AvailableEmployeesTable";

const queryClient = new QueryClient();

function NewScheduleController() {
  const { getAuthSession } = useContext(AuthenticationContext);
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("6:45 pm");
  const [endTime, setEndTime] = useState<string>("12:15 am");
  const { isFetching, data: schedulingData } = useSchedulingData({
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
    form.setValue("shifts", getGamesTemplate(startTime, endTime, schedulingData.metadata.shiftTimes).shifts);
  }

  function useWWTemplate(): void {
    form.setValue("shifts", getWWTemplate(startTime, endTime, schedulingData.metadata.shiftTimes).shifts);
  }

  function onOpenChange(): void {
    setOpen(!open);
  }

  function onChangeStartTime(newStartTime: string): void {
    setStartTime(newStartTime);
    const currentFormData: NewScheduleSchemaFormData = form.getValues();

    form.setValue(
      "shifts",
      currentFormData.shifts.map((shift) => {
        return {
          ...shift,
          startTime: newStartTime,
        };
      }),
    );
  }

  function onChangeEndTime(newEndTime: string): void {
    setEndTime(newEndTime);
    const currentFormData: NewScheduleSchemaFormData = form.getValues();

    form.setValue(
      "shifts",
      currentFormData.shifts.map((shift) => {
        return {
          ...shift,
          endTime: newEndTime,
        };
      }),
    );
  }

  const availableEmployees: AvailableEmployee[] = schedulingData.availability[dateToFormatForUser(date)] || [];
  const availableEmployeeNames: string[] = useMemo(() => {
    return availableEmployees.map((employee) => employee.name);
  }, [schedulingData, date]);
  const selectedAvailableEmployeeNames: Set<string> = useMemo(() => {
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
      availableEmployeeNames={availableEmployeeNames}
      selectedAvailableEmployeeNames={selectedAvailableEmployeeNames}
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
      availabilityTable={
        <AvailableEmployeesTable
          isLoading={isFetching}
          schedulingData={schedulingData}
          selectedEmployees={selectedAvailableEmployeeNames}
          schedulingForDate={dateToFormatForUser(date)}
        />
      }
      onChangeStartTime={onChangeStartTime}
      onChangeEndTime={onChangeEndTime}
      startTime={startTime}
      endTime={endTime}
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
