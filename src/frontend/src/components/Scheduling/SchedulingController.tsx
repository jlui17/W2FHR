import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  dateToFormatForApi,
  ERROR_MESSAGES,
  TOAST,
} from "@/components/common/constants";
import { toast } from "sonner";
import { ReactElement, useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";
import { useScheduleData } from "@/components/Schedule/helpers/hooks";
import { Shift } from "@/components/Timesheet/helpers/hooks";
import {
  convertToShifts,
  sortData,
} from "@/components/Schedule/ScheduleController";
import { SchedulingForm } from "@/components/Scheduling/SchedulingForm";
import {
  SchedulingData,
  UpdateSchedulingRequest,
  useSchedulingData,
  useUpdateSchedulingData,
} from "@/components/Scheduling/helpers/hooks";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error(`Error in Manager Schedule:\n${error}`);
      let errMsg: string = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (error instanceof Error) {
        errMsg = error.message;
      }
      toast.error(TOAST.HEADERS.ERROR, {
        description: errMsg,
        duration: TOAST.DURATIONS.ERROR,
      });
    },
  }),
});
const SCHEDULING_DATA_QUERY_KEY: string[] = ["scheduling"];

const EMPTY_DATA: Shift[] = [];

const SchedulingSchema = z.object({
  startOfWeek: z.date(),
  disableUpdates: z.boolean(),
  showMonday: z.boolean(),
});
export type SchedulingSchemaFormData = z.infer<typeof SchedulingSchema>;

function SchedulingController(): ReactElement {
  const { getAuthSession } = useContext(AuthenticationContext);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [open, setOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const {
    refetch: refetchSchedule,
    isFetching: isFetchingSchedule,
    data: scheduleData,
  } = useScheduleData({
    idToken: getAuthSession()?.idToken || "",
    start: startDate,
    end: endDate,
    queryKey: [startDate.toISOString(), endDate.toISOString()],
  });

  const {
    refetch: refetchSchedulingData,
    isFetching: isFetchingSchedulingData,
    data: schedulingData,
  } = useSchedulingData({
    idToken: getAuthSession()?.idToken || "",
    queryKey: SCHEDULING_DATA_QUERY_KEY,
  });

  const { mutate: updateSchedulingData, isPending: isUpdating } =
    useUpdateSchedulingData({
      onSuccess: (data: SchedulingData) => {
        queryClient.setQueryData(SCHEDULING_DATA_QUERY_KEY, data);
        toast.success(TOAST.HEADERS.SUCCESS, {
          description: "The schedule has been updated.",
          duration: TOAST.DURATIONS.SUCCESS,
        });
      },
      onError: (error: Error) => {
        console.error(`Error in Scheduling:\n${error}`);
        let message: string = ERROR_MESSAGES.UNKNOWN_ERROR;
        if (error instanceof Error) {
          message = error.message;
        }
        toast.error(TOAST.HEADERS.ERROR, {
          description: message,
          duration: TOAST.DURATIONS.ERROR,
        });
      },
    });

  const form = useForm<SchedulingSchemaFormData>({
    resolver: zodResolver(SchedulingSchema),
    defaultValues: {
      startOfWeek: new Date(),
      showMonday: false,
      disableUpdates: false,
    },
  });

  useEffect(() => {
    if (schedulingData !== undefined) {
      form.reset({
        startOfWeek: schedulingData.startOfWeek,
        showMonday: schedulingData.showMonday,
        disableUpdates: schedulingData.disableUpdates,
      });
    }
  }, [schedulingData]);

  const isFetching: boolean =
    isFetchingSchedule || isFetchingSchedulingData || isUpdating;

  function onSortChange(): void {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  }

  function onOpenChange(): void {
    if (open && scheduleData === undefined) {
      refetchSchedule();
      refetchSchedulingData();
    }

    setOpen(!open);
  }

  function onSetStartDate(date: Date): void {
    if (date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  }

  function onSetEndDate(date: Date): void {
    if (date < startDate) {
      setStartDate(date);
    }
    setEndDate(date);
  }

  async function onSubmit(data: SchedulingSchemaFormData): Promise<void> {
    // console.log(data);
    // return;
    const req: UpdateSchedulingRequest = {
      idToken: getAuthSession()?.idToken || "",
      updates: {},
    };
    if (
      schedulingData !== undefined &&
      data.showMonday !== schedulingData.showMonday
    ) {
      req.updates.showMonday = data.showMonday;
    }
    if (
      schedulingData !== undefined &&
      data.disableUpdates !== schedulingData.disableUpdates
    ) {
      req.updates.disableUpdates = data.disableUpdates;
    }
    if (schedulingData !== undefined) {
      const dateInApiFormat: string = dateToFormatForApi(data.startOfWeek);
      const originalDateInApiFormat: string = dateToFormatForApi(
        schedulingData.startOfWeek,
      );
      if (dateInApiFormat !== originalDateInApiFormat) {
        req.updates.startOfWeek = dateInApiFormat;
      }
    }

    if (Object.keys(req.updates).length === 0) {
      return;
    }
    console.log("Updating...", req);
    updateSchedulingData(req);
  }

  if (scheduleData === undefined || schedulingData === undefined) {
    return (
      <SchedulingForm
        open={open}
        onOpenChange={onOpenChange}
        isLoading={isFetching}
        startDate={startDate}
        onSetStartDate={onSetStartDate}
        endDate={endDate}
        onSetEndDate={onSetEndDate}
        shifts={EMPTY_DATA}
        onSortChange={onSortChange}
        onSubmit={() => {}}
        form={form}
      />
    );
  }

  sortData(scheduleData, sortOrder);
  return (
    <SchedulingForm
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isFetching}
      startDate={startDate}
      onSetStartDate={onSetStartDate}
      endDate={endDate}
      onSetEndDate={onSetEndDate}
      shifts={convertToShifts(scheduleData)}
      onSortChange={onSortChange}
      onSubmit={onSubmit}
      form={form}
    />
  );
}

export function Scheduling(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulingController />
    </QueryClientProvider>
  );
}
