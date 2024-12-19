import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ERROR_MESSAGES, TOAST } from "@/components/common/constants";
import { toast } from "sonner";
import { ScheduleWidget } from "./ScheduleWidget";
import { ReactElement, useContext, useState } from "react";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";
import {
  ScheduleData,
  useScheduleData,
} from "@/components/Schedule/helpers/hooks";
import { Shift } from "@/components/Timesheet/helpers/hooks";

const EMPTY_DATA: Shift[] = [];

function sortData(data: ScheduleData, sortOrder: "asc" | "desc"): ScheduleData {
  data.shifts.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.date.getTime() - b.date.getTime();
    } else {
      return b.date.getTime() - a.date.getTime();
    }
  });
  return data;
}

function convertToShifts(data: ScheduleData): Shift[] {
  return data.shifts.map((shift): Shift => {
    return {
      date: shift.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      shiftTitle: shift.shiftTitle,
      netHours: shift.netHours,
      employeeName: shift.employeeName,
    };
  });
}

function ScheduleController(): ReactElement {
  const { getAuthSession, hasAccessToFeature } = useContext(
    AuthenticationContext,
  );
  if (!hasAccessToFeature("schedule")) {
    return <></>;
  }

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [open, setOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const {
    refetch,
    isFetching,
    data: scheduleData,
  } = useScheduleData({
    idToken: getAuthSession()?.idToken || "",
    start: startDate,
    end: endDate,
    queryKey: [startDate.toISOString(), endDate.toISOString()],
  });

  function onSortChange(): void {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  }

  function onOpenChange(): void {
    if (open && scheduleData === undefined) {
      refetch();
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

  if (scheduleData === undefined) {
    return (
      <ScheduleWidget
        open={open}
        onOpenChange={onOpenChange}
        isLoading={isFetching}
        startDate={startDate}
        onSetStartDate={onSetStartDate}
        endDate={endDate}
        onSetEndDate={onSetEndDate}
        shifts={EMPTY_DATA}
        onSortChange={onSortChange}
      />
    );
  }
  sortData(scheduleData, sortOrder);
  return (
    <ScheduleWidget
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isFetching}
      startDate={startDate}
      onSetStartDate={onSetStartDate}
      endDate={endDate}
      onSetEndDate={onSetEndDate}
      shifts={convertToShifts(scheduleData)}
      onSortChange={onSortChange}
    />
  );
}

export function Schedule(): ReactElement {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in Timesheet:\n${error}`);
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

  return (
    <QueryClientProvider client={queryClient}>
      <ScheduleController />
    </QueryClientProvider>
  );
}
