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
import { endOfWeek, startOfWeek } from "date-fns";

const EMPTY_DATA: ScheduleData = { shifts: [] };

function sortData(data: ScheduleData, sortOrder: "asc" | "desc"): ScheduleData {
  const sortedData = [...data.shifts].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.date.getTime() - b.date.getTime();
    } else {
      return b.date.getTime() - a.date.getTime();
    }
  });
  return { shifts: sortedData };
}

function ScheduleController(): ReactElement {
  const { getAuthSession, hasAccessToFeature } = useContext(
    AuthenticationContext,
  );
  if (!hasAccessToFeature("schedule")) {
    return <></>;
  }

  const [open, setOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [endDate, setEndDate] = useState<Date>(
    endOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const {
    refetch,
    isFetching,
    data: scheduleData,
  } = useScheduleData({
    idToken: getAuthSession()?.idToken || "",
    start: startDate,
    end: endDate,
    enabled: open,
    queryKey: [
      "schedule",
      startDate.toISOString(),
      endDate.toISOString(),
      String(open),
    ],
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  function onSortChange(): void {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  }

  function onOpenChange(): void {
    if (open && scheduleData === undefined) {
      refetch();
    }

    setOpen(!open);
  }

  if (scheduleData === undefined) {
    return (
      <ScheduleWidget
        open={open}
        onOpenChange={onOpenChange}
        isLoading={isFetching}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        schedule={EMPTY_DATA}
        onSortChange={onSortChange}
      />
    );
  }

  return (
    <ScheduleWidget
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isFetching}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      schedule={sortData(scheduleData, sortOrder)}
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
