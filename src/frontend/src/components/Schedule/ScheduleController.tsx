import { dateToFormatForUser } from "@/components/common/constants";
import { ScheduleWidget } from "./ScheduleWidget";
import { ReactElement, useContext, useState } from "react";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";
import {
  ScheduleData,
  useScheduleData,
} from "@/components/Schedule/helpers/hooks";
import { Shift } from "@/components/Timesheet/helpers/hooks";

const EMPTY_DATA: Shift[] = [];

export function sortData(
  data: ScheduleData,
  sortOrder: "asc" | "desc",
): ScheduleData {
  data.shifts.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.date.getTime() - b.date.getTime();
    } else {
      return b.date.getTime() - a.date.getTime();
    }
  });
  return data;
}

export function convertToShifts(data: ScheduleData): Shift[] {
  return data.shifts.map((shift): Shift => {
    return {
      date: dateToFormatForUser(shift.date),
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      shiftTitle: shift.shiftTitle,
      netHours: shift.netHours,
      employeeName: shift.employeeName,
    };
  });
}

function ScheduleController(p: { noCollapsible: boolean }): ReactElement {
  const { getAuthSession } = useContext(AuthenticationContext);

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
        noCollapsible={p.noCollapsible}
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
      noCollapsible={p.noCollapsible}
    />
  );
}

export function Schedule(p: { noCollapsible?: boolean }): ReactElement {
  return <ScheduleController noCollapsible={p.noCollapsible || false} />;
}
